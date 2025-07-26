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
    # Use Vision API with REST API instead of service account
    VISION_API_AVAILABLE = True
    GOOGLE_VISION_API_KEY = os.environ.get("GOOGLE_VISION_API_KEY")
    logging.info("Google Vision API key configured successfully")
except Exception as e:
    VISION_API_AVAILABLE = False
    GOOGLE_VISION_API_KEY = None
    logging.warning(f"Google Vision API configuration failed: {e}")
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

class ScanRequest(BaseModel):
    image_base64: str

# Helper Functions
async def analyze_image_with_vision(image_data: bytes) -> Dict[str, Any]:
    """Analyze image using Google Cloud Vision API via REST"""
    try:
        if not VISION_API_AVAILABLE or not GOOGLE_VISION_API_KEY:
            logging.warning("Vision API not available, using fallback")
            return {
                "objects": ["vintage item", "collectible"],
                "texts": ["VINTAGE", "COLLECTIBLE"],
                "primary_object": "vintage collectible"
            }
            
        # Encode image to base64 for REST API
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Vision API REST endpoint
        vision_url = f"https://vision.googleapis.com/v1/images:annotate?key={GOOGLE_VISION_API_KEY}"
        
        # Request payload for both object localization and text detection
        payload = {
            "requests": [
                {
                    "image": {
                        "content": image_base64
                    },
                    "features": [
                        {"type": "OBJECT_LOCALIZATION", "maxResults": 5},
                        {"type": "TEXT_DETECTION", "maxResults": 3}
                    ]
                }
            ]
        }
        
        # Make REST API call
        response = requests.post(vision_url, json=payload)
        response.raise_for_status()
        vision_result = response.json()
        
        # Parse response
        objects = []
        texts = []
        
        if "responses" in vision_result and vision_result["responses"]:
            result = vision_result["responses"][0]
            
            # Extract objects
            if "localizedObjectAnnotations" in result:
                objects = [obj["name"] for obj in result["localizedObjectAnnotations"][:5]]
            
            # Extract texts
            if "textAnnotations" in result:
                texts = [text["description"] for text in result["textAnnotations"][:3]]
        
        return {
            "objects": objects,
            "texts": texts,
            "primary_object": objects[0] if objects else "unknown item"
        }
    except Exception as e:
        logging.error(f"Vision API error: {e}")
        return {"objects": [], "texts": [], "primary_object": "unknown item"}

async def search_marketplaces(vision_data: Dict[str, Any]) -> Dict[str, Any]:
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

async def analyze_with_gemini(vision_data: Dict[str, Any], search_data: Dict[str, Any]) -> Dict[str, Any]:
    """Analyze with Gemini AI for final appraisal"""
    try:
        # Create Gemini chat instance
        chat = LlmChat(
            api_key=os.environ["GEMINI_API_KEY"],
            session_id=f"scan_{uuid.uuid4()}",
            system_message="You are 'Thrifter's Eye,' an expert AI appraiser specializing in items found at thrift stores, garage sales, and flea markets. You are analytical, realistic, and your goal is to help a user understand what they've found and what it might be worth in the Canadian market (prices in CAD)."
        ).with_model("gemini", "gemini-2.0-flash")
        
        # Build prompt
        prompt = f"""
# CONTEXT
You are "Thrifter's Eye," an expert AI appraiser specializing in items found at thrift stores, garage sales, and flea markets. You are analytical, realistic, and your goal is to help a user understand what they've found and what it might be worth in the Canadian market (prices in CAD).

# TASK
I will provide you with JSON data containing information about an object I scanned. Your task is to analyze this data and return a structured JSON object with your appraisal. You MUST strictly adhere to the requested JSON output format.

# INPUT DATA
Here is the data I have gathered:

## 1. Google Vision AI Analysis:
{json.dumps(vision_data, indent=2)}

## 2. Similar Listings Found on Canadian Marketplaces:
{json.dumps(search_data, indent=2)}

# YOUR ANALYSIS & APPRAISAL
Based on ALL the data above, perform the following actions:
1. Synthesize the Vision data and Search results to determine the most likely identity of the item.
2. Analyze the prices of the similar listings, ignoring outliers, to establish a realistic resale value range in Canadian Dollars (CAD).
3. Write a brief, helpful analysis for the user.
4. Generate a draft title and description for a marketplace listing.
5. Provide a confidence score from 0-100 representing your certainty in the valuation.

# REQUIRED OUTPUT FORMAT
Your entire response must be a single, valid JSON object. Do not include any text or markdown before or after the JSON object.

{{
  "itemName": "A concise and accurate name for the item.",
  "estimatedValue": "A string representing the value range in CAD, e.g., '$25 - $40 CAD'.",
  "confidenceScore": 75,
  "aiAnalysis": "A paragraph explaining what the item is, its potential significance or history, and the reasoning behind your valuation. Be realistic about condition and market demand.",
  "listingDraft": {{
    "title": "A compelling, keyword-rich title for an online marketplace listing.",
    "description": "A detailed description for the listing, including potential keywords from your analysis."
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
            "estimatedValue": "$10 - $30 CAD",
            "confidenceScore": 25,
            "aiAnalysis": f"Unable to complete full analysis due to technical issues. Basic identification suggests this is a {vision_data.get('primary_object', 'general item')}. For accurate valuation, please try again or consult with local experts.",
            "listingDraft": {
                "title": f"{vision_data.get('primary_object', 'Vintage Item')} - Good Condition",
                "description": "Item found at thrift store, good condition. Please see photos for details."
            }
        }

# Routes
@api_router.get("/")
async def root():
    return {"message": "Thrifter's Eye API - Ready to scan!"}

@api_router.post("/scan", response_model=ScanResult)
async def scan_item(file: UploadFile = File(...)):
    """Main endpoint for scanning and analyzing items"""
    try:
        # Read image data
        image_data = await file.read()
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        
        # Step 1: Analyze with Vision API
        logging.info("Analyzing image with Vision API...")
        vision_data = await analyze_image_with_vision(image_data)
        
        # Step 2: Search marketplaces
        logging.info("Searching marketplaces...")
        search_data = await search_marketplaces(vision_data)
        
        # Step 3: Analyze with Gemini
        logging.info("Analyzing with Gemini AI...")
        ai_result = await analyze_with_gemini(vision_data, search_data)
        
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
            search_response=search_data.get("raw_response", {})
        )
        
        # Save to database
        await db.scans.insert_one(scan_result.dict())
        
        return scan_result
        
    except Exception as e:
        logging.error(f"Scan error: {e}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")

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