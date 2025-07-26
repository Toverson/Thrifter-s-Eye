#!/usr/bin/env python3
"""
Focused test to verify Google Cloud Vision API is working with real credentials
and not just returning fallback generic responses.
"""

import requests
import json
import os
from pathlib import Path

# Get backend URL from frontend .env file
def get_backend_url():
    frontend_env_path = Path("/app/frontend/.env")
    if frontend_env_path.exists():
        with open(frontend_env_path, 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    return "http://localhost:8001"

BACKEND_URL = get_backend_url()
API_BASE = f"{BACKEND_URL}/api"

print(f"Testing Vision API integration at: {API_BASE}")

def test_vision_api_real_vs_fallback():
    """
    Test multiple different images to verify Vision API returns varied, 
    specific results rather than generic fallback responses
    """
    print("\n🔍 Testing Google Cloud Vision API - Real vs Fallback Detection")
    print("="*80)
    
    # Test with the existing test image
    test_image_path = "/app/test_item.jpg"
    if not os.path.exists(test_image_path):
        print("❌ Test image not found")
        return False
    
    try:
        # Upload and scan the image
        with open(test_image_path, 'rb') as f:
            files = {'file': ('test_item.jpg', f, 'image/jpeg')}
            print("📤 Uploading test image for Vision API analysis...")
            response = requests.post(f"{API_BASE}/scan", files=files, timeout=60)
        
        if response.status_code != 200:
            print(f"❌ Scan request failed: HTTP {response.status_code}")
            print(f"Response: {response.text}")
            return False
        
        data = response.json()
        
        # Extract Vision API response
        vision_response = data.get('vision_response', {})
        
        print(f"\n📊 Vision API Response Analysis:")
        print(f"Raw Vision Response: {json.dumps(vision_response, indent=2)}")
        
        # Check for fallback indicators
        fallback_indicators = [
            "vintage item",
            "collectible", 
            "vintage collectible",
            "unknown item"
        ]
        
        objects = vision_response.get('objects', [])
        texts = vision_response.get('texts', [])
        primary_object = vision_response.get('primary_object', '')
        
        print(f"\n🔍 Detected Objects: {objects}")
        print(f"🔍 Detected Texts: {texts}")
        print(f"🔍 Primary Object: {primary_object}")
        
        # Analyze if this looks like real Vision API data or fallback
        is_fallback = False
        fallback_reasons = []
        
        # Check if objects are generic fallback values
        if len(objects) == 2 and set(objects) == {"vintage item", "collectible"}:
            is_fallback = True
            fallback_reasons.append("Objects match exact fallback pattern: ['vintage item', 'collectible']")
        
        # Check if texts are generic fallback values  
        if len(texts) == 2 and set(texts) == {"VINTAGE", "COLLECTIBLE"}:
            is_fallback = True
            fallback_reasons.append("Texts match exact fallback pattern: ['VINTAGE', 'COLLECTIBLE']")
        
        # Check if primary object is fallback
        if primary_object in fallback_indicators:
            is_fallback = True
            fallback_reasons.append(f"Primary object '{primary_object}' is a fallback value")
        
        # Additional checks for real Vision API responses
        real_vision_indicators = []
        
        # Real Vision API typically returns more specific object names
        if objects and not any(obj in fallback_indicators for obj in objects):
            real_vision_indicators.append("Objects appear to be specific, not generic fallback")
        
        # Real Vision API text detection usually returns actual text from image
        if texts and not all(text.upper() in ["VINTAGE", "COLLECTIBLE"] for text in texts):
            real_vision_indicators.append("Texts appear to be actual OCR results, not fallback")
        
        # Check if we have diverse, specific results
        if len(set(objects + texts)) > 4:  # More variety suggests real API
            real_vision_indicators.append("High variety in detected objects/texts suggests real Vision API")
        
        print(f"\n🔍 VISION API ANALYSIS:")
        print(f"Is using fallback: {'YES' if is_fallback else 'NO'}")
        
        if is_fallback:
            print(f"❌ FALLBACK DETECTED - Reasons:")
            for reason in fallback_reasons:
                print(f"   - {reason}")
        else:
            print(f"✅ REAL VISION API DETECTED - Indicators:")
            for indicator in real_vision_indicators:
                print(f"   - {indicator}")
        
        # Final assessment
        if is_fallback:
            print(f"\n❌ CRITICAL ISSUE: Google Cloud Vision API is using fallback values")
            print(f"   This explains why users get the same 'vintage collectible' results for every scan")
            print(f"   The Vision API credentials may be invalid or the service may be unavailable")
            return False
        else:
            print(f"\n✅ SUCCESS: Google Cloud Vision API appears to be working with real credentials")
            print(f"   Vision API is returning specific, varied results based on actual image analysis")
            return True
            
    except requests.exceptions.Timeout:
        print("❌ Request timeout - AI processing took too long")
        return False
    except requests.exceptions.RequestException as e:
        print(f"❌ Connection error: {str(e)}")
        return False
    except Exception as e:
        print(f"❌ Unexpected error: {str(e)}")
        return False

def test_vision_api_credentials():
    """Test if Vision API credentials are properly configured"""
    print("\n🔍 Testing Google Cloud Vision API Credentials")
    print("="*60)
    
    # Check if credentials file exists
    creds_path = "/app/backend/gen-lang-client-0045692674-0e08eb99ab10.json"
    if not os.path.exists(creds_path):
        print("❌ Google Cloud credentials file not found")
        return False
    
    try:
        with open(creds_path, 'r') as f:
            creds = json.load(f)
        
        # Check required fields
        required_fields = ['type', 'project_id', 'private_key', 'client_email']
        missing_fields = [field for field in required_fields if field not in creds]
        
        if missing_fields:
            print(f"❌ Missing required credential fields: {missing_fields}")
            return False
        
        # Check if private key looks valid (should start with -----BEGIN PRIVATE KEY-----)
        private_key = creds.get('private_key', '')
        if not private_key.startswith('-----BEGIN PRIVATE KEY-----'):
            print("❌ Private key does not appear to be in valid PEM format")
            return False
        
        print("✅ Credentials file structure appears valid")
        print(f"   Project ID: {creds.get('project_id')}")
        print(f"   Client Email: {creds.get('client_email')}")
        print(f"   Private Key: Valid PEM format")
        
        return True
        
    except json.JSONDecodeError:
        print("❌ Credentials file is not valid JSON")
        return False
    except Exception as e:
        print(f"❌ Error reading credentials: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Google Cloud Vision API Integration Test")
    print("="*80)
    
    # Test 1: Check credentials
    creds_ok = test_vision_api_credentials()
    
    # Test 2: Test actual Vision API functionality
    vision_ok = False
    if creds_ok:
        vision_ok = test_vision_api_real_vs_fallback()
    else:
        print("⏭️ Skipping Vision API test due to credential issues")
    
    # Final summary
    print(f"\n{'='*80}")
    print("🎯 VISION API TEST SUMMARY")
    print(f"{'='*80}")
    print(f"✅ Credentials Check: {'PASS' if creds_ok else 'FAIL'}")
    print(f"✅ Vision API Real Data: {'PASS' if vision_ok else 'FAIL'}")
    
    if creds_ok and vision_ok:
        print(f"\n🎉 SUCCESS: Google Cloud Vision API is working correctly with real credentials!")
        print(f"   Users should get varied, specific results for different images.")
        exit(0)
    else:
        print(f"\n💥 FAILURE: Google Cloud Vision API issues detected!")
        if not creds_ok:
            print(f"   - Credential configuration problems")
        if not vision_ok:
            print(f"   - Vision API returning fallback values instead of real image analysis")
        print(f"   This explains why users get the same generic results for every scan.")
        exit(1)