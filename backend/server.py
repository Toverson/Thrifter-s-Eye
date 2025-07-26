from fastapi import FastAPI, APIRouter, File, UploadFile, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime
import json
import time
import io
import base64
import requests
from google.cloud import vision
from emergentintegrations.llm.chat import LlmChat, UserMessage

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Google Vision API client - with error handling
try:
    vision_client = vision.ImageAnnotatorClient()
    VISION_API_AVAILABLE = True
    logging.info("Google Vision API client initialized successfully")
except Exception as e:
    vision_client = None
    VISION_API_AVAILABLE = False
    logging.warning(f"Google Vision API client initialization failed: {e}")
    logging.warning("Vision API features will be disabled")

# Models
class ScanResult(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    user_id: str = "prototype_user_01"
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    image_base64: str
    item_name: str
    estimated_value: str
    confidence_score: int
    ai_analysis: str
    listing_draft: Dict[str, str]
    similar_listings: List[Dict[str, Any]]
    vision_response: Optional[Dict[str, Any]] = None
    search_response: Optional[Dict[str, Any]] = None
    country_code: Optional[str] = "US"
    currency_code: Optional[str] = "USD"

class ScanRequest(BaseModel):
    imageBase64: str
    countryCode: Optional[str] = "US"
    currencyCode: Optional[str] = "USD"

# Helper Functions
async def analyze_image_with_vision(image_data: bytes) -> Dict[str, Any]:
    """Analyze image using Google Cloud Vision API"""
    try:
        if not VISION_API_AVAILABLE or vision_client is None:
            logging.warning("Vision API not available, using fallback")
            return {
                "objects": ["vintage item", "collectible"],
                "texts": ["VINTAGE", "COLLECTIBLE"],
                "primary_object": "vintage collectible"
            }
            
        image = vision.Image(content=image_data)
        
        # Object localization
        objects_response = vision_client.object_localization(image=image)
        objects = [obj.name for obj in objects_response.localized_object_annotations[:5]]
        
        # Text detection
        text_response = vision_client.text_detection(image=image)
        texts = []
        if text_response.text_annotations:
            texts = [text.description for text in text_response.text_annotations[:3]]
        
        return {
            "objects": objects,
            "texts": texts,
            "primary_object": objects[0] if objects else "unknown item"
        }
    except Exception as e:
        logging.error(f"Vision API error: {e}")
        return {"objects": [], "texts": [], "primary_object": "unknown item"}

async def search_marketplaces(vision_data: Dict[str, Any], country_code: str = "US") -> Dict[str, Any]:
    """Search marketplaces using Google Custom Search API"""
    try:
        # Build search query from vision data
        search_terms = []
        if vision_data.get("texts"):
            search_terms.extend(vision_data["texts"][:2])
        if vision_data.get("primary_object"):
            search_terms.append(vision_data["primary_object"])
        
        query = " ".join(search_terms) if search_terms else "vintage collectible"
        
        # Google Custom Search API
        search_url = "https://www.googleapis.com/customsearch/v1"
        params = {
            "key": os.environ["GOOGLE_SEARCH_API_KEY"],
            "cx": os.environ["GOOGLE_SEARCH_ENGINE_ID"],
            "q": f"{query} price value",
            "num": 5
        }
        
        response = requests.get(search_url, params=params)
        search_data = response.json()
        
        similar_listings = []
        if "items" in search_data:
            for item in search_data["items"][:5]:
                similar_listings.append({
                    "title": item.get("title", ""),
                    "link": item.get("link", ""),
                    "snippet": item.get("snippet", ""),
                    "price": "N/A"  # Would need additional parsing for actual prices
                })
        
        return {
            "query": query,
            "similar_listings": similar_listings,
            "raw_response": search_data
        }
    except Exception as e:
        logging.error(f"Search API error: {e}")
        return {"query": "", "similar_listings": [], "raw_response": {}}

async def analyze_with_gemini(vision_data: Dict[str, Any], search_data: Dict[str, Any], country_code: str = "US", currency_code: str = "USD") -> Dict[str, Any]:
    """Analyze with Gemini AI for final appraisal"""
    try:
        # Create Gemini chat instance
        chat = LlmChat(
            api_key=os.environ["GEMINI_API_KEY"],
            session_id=f"scan_{uuid.uuid4()}",
            system_message=f"You are 'Thrifter's Eye,' an expert AI appraiser specializing in items found at thrift stores, garage sales, and flea markets. You are analytical, realistic, and your goal is to help a user understand what they've found and what it might be worth in the {country_code} market (prices in {currency_code})."
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Build prompt with location-aware context
        prompt = f"""
# CONTEXT
You are "Thrifter's Eye," an expert AI appraiser specializing in items found at thrift stores, garage sales, and flea markets. You are analytical, realistic, and your goal is to help a user understand what they've found and what it might be worth in the {country_code} market (prices in {currency_code}).

# TASK
I will provide you with JSON data containing information about an object I scanned. Your task is to analyze this data and return a structured JSON object with your appraisal. You MUST strictly adhere to the requested JSON output format.

# INPUT DATA
Here is the data I have gathered:

## 1. Google Vision AI Analysis:
{json.dumps(vision_data, indent=2)}

## 2. Similar Listings Found on {country_code} Marketplaces:
{json.dumps(search_data, indent=2)}

# YOUR ANALYSIS & APPRAISAL
Based on ALL the data above, perform the following actions:
1. Synthesize the Vision data and Search results to determine the most likely identity of the item.
2. Analyze the prices of the similar listings, ignoring outliers, to establish a realistic resale value range in {currency_code}.
3. Write a brief, helpful analysis for the user, considering the {country_code} market conditions.
4. Generate a draft title and description for a marketplace listing suitable for the {country_code} market.
5. Provide a confidence score from 0-100 representing your certainty in the valuation.

# REQUIRED OUTPUT FORMAT
Your entire response must be a single, valid JSON object. Do not include any text or markdown before or after the JSON object.

{{
  "itemName": "A concise and accurate name for the item.",
  "estimatedValue": "A string representing the value range in {currency_code}, e.g., '$25 - $40 {currency_code}'.",
  "confidenceScore": 75,
  "aiAnalysis": "A paragraph explaining what the item is, its potential significance or history, and the reasoning behind your valuation in the {country_code} market. Be realistic about condition and market demand.",
  "listingDraft": {{
    "title": "A compelling, keyword-rich title for an online marketplace listing in {country_code}.",
    "description": "A detailed description for the listing, including potential keywords from your analysis suitable for {country_code} buyers."
  }}
}}
"""

        user_message = UserMessage(text=prompt)
        response = await chat.send_message(user_message)
        
        # Parse JSON response
        response_text = response.strip()
        if response_text.startswith("```json"):
            response_text = response_text[7:-3]
        elif response_text.startswith("```"):
            response_text = response_text[3:-3]
        
        ai_result = json.loads(response_text)
        return ai_result
        
    except Exception as e:
        logging.error(f"Gemini API error: {e}")
        return {
            "itemName": vision_data.get("primary_object", "Unknown Item"),
            "estimatedValue": f"$10 - $30 {currency_code}",
            "confidenceScore": 25,
            "aiAnalysis": f"Unable to complete full analysis due to technical issues. Basic identification suggests this is a {vision_data.get('primary_object', 'general item')}. For accurate valuation in the {country_code} market, please try again or consult with local experts.",
            "listingDraft": {
                "title": f"{vision_data.get('primary_object', 'Vintage Item')} - Good Condition",
                "description": f"Item found at thrift store, good condition. Suitable for {country_code} market. Please see photos for details."
            }
        }

# Routes
@api_router.get("/")
async def root():
    return {"message": "Thrifter's Eye API - Ready to scan!"}

@api_router.post("/scan", response_model=ScanResult)
async def scan_item(request: ScanRequest):
    """Main endpoint for scanning and analyzing items"""
    try:
        # Handle both file upload and JSON request formats
        if hasattr(request, 'imageBase64'):
            # JSON request format (from web app)
            image_base64 = request.imageBase64
            country_code = getattr(request, 'countryCode', 'US')
            currency_code = getattr(request, 'currencyCode', 'USD')
            image_data = base64.b64decode(image_base64)
        else:
            # File upload format (legacy)
            image_data = request
            image_base64 = base64.b64encode(image_data).decode('utf-8')
            country_code = 'US'
            currency_code = 'USD'
        
        # Step 1: Analyze with Vision API
        logging.info("Analyzing image with Vision API...")
        vision_data = await analyze_image_with_vision(image_data)
        
        # Step 2: Search marketplaces
        logging.info("Searching marketplaces...")
        search_data = await search_marketplaces(vision_data, country_code)
        
        # Step 3: Analyze with Gemini (update prompt for location-aware analysis)
        logging.info("Analyzing with Gemini AI...")
        ai_result = await analyze_with_gemini(vision_data, search_data, country_code, currency_code)
        
        # Create scan result
        scan_result = ScanResult(
            image_base64=image_base64,
            item_name=ai_result.get("itemName", "Unknown Item"),
            estimated_value=ai_result.get("estimatedValue", "Unknown"),
            confidence_score=ai_result.get("confidenceScore", 0),
            ai_analysis=ai_result.get("aiAnalysis", "No analysis available"),
            listing_draft=ai_result.get("listingDraft", {"title": "", "description": ""}),
            similar_listings=search_data.get("similar_listings", []),
            vision_response=vision_data,
            search_response=search_data.get("raw_response", {}),
            country_code=country_code,
            currency_code=currency_code
        )
        
        # Store in database
        await db.scans.insert_one(scan_result.dict())
        logging.info(f"Scan result stored in database with ID: {scan_result.id}")
        
        return scan_result
        
    except Exception as e:
        logging.error(f"Scan error: {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

@api_router.post("/scan-file")
async def scan_item_file(file: UploadFile = File(...)):
    """File upload endpoint for scanning items"""
    try:
        # Read image data
        image_data = await file.read()
        
        # Create a request object and call the main scan function
        class FileRequest:
            def __init__(self, data):
                self.data = data
        
        return await scan_item(image_data)
        
    except Exception as e:
        logging.error(f"File scan error: {e}")
        raise HTTPException(status_code=500, detail=f"File scan failed: {str(e)}")

@api_router.get("/history", response_model=List[ScanResult])
async def get_scan_history():
    """Get scan history for the user"""
    try:
        scans = await db.scans.find({"user_id": "prototype_user_01"}).sort("timestamp", -1).to_list(50)
        return [ScanResult(**scan) for scan in scans]
    except Exception as e:
        logging.error(f"History error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get history: {str(e)}")

@api_router.get("/scan/{scan_id}", response_model=ScanResult)
async def get_scan_result(scan_id: str):
    """Get specific scan result"""
    try:
        scan = await db.scans.find_one({"id": scan_id})
        if not scan:
            raise HTTPException(status_code=404, detail="Scan not found")
        return ScanResult(**scan)
    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Get scan error: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to get scan: {str(e)}")

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()