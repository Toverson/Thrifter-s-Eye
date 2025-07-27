#!/usr/bin/env python3
"""
Focused Test for Scanning Mechanism with userId Parameter
Tests the specific issue reported: scans failing after privacy fixes
"""

import requests
import json
import base64
import time
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

print(f"🎯 FOCUSED SCAN TEST - Testing userId Parameter Fix")
print(f"Backend URL: {API_BASE}")
print(f"{'='*80}")

def test_complete_scan_flow():
    """Test complete end-to-end scan flow with userId parameter"""
    
    # Test user ID
    test_user_id = "focused_test_user_2025"
    
    print(f"\n🔍 TESTING COMPLETE SCAN FLOW WITH userId: '{test_user_id}'")
    print("="*60)
    
    # Step 1: Test POST /api/scan with userId
    print("\n📤 STEP 1: Testing POST /api/scan with userId parameter...")
    
    # Create a simple test image (1x1 pixel PNG in base64)
    test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA4GgKxQAAAABJRU5ErkJggg=="
    
    payload = {
        "imageBase64": test_image_base64,
        "countryCode": "US",
        "currencyCode": "USD",
        "userId": test_user_id
    }
    
    try:
        print("   Sending scan request...")
        response = requests.post(
            f"{API_BASE}/scan", 
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=60
        )
        
        if response.status_code == 200:
            scan_data = response.json()
            scan_id = scan_data.get('id')
            
            print(f"   ✅ Scan successful!")
            print(f"   - Scan ID: {scan_id}")
            print(f"   - User ID: {scan_data.get('user_id')}")
            print(f"   - Item Name: {scan_data.get('item_name', 'N/A')}")
            print(f"   - Estimated Value: {scan_data.get('estimated_value', 'N/A')}")
            print(f"   - Confidence Score: {scan_data.get('confidence_score', 'N/A')}%")
            
            # Verify required fields
            required_fields = ['id', 'user_id', 'item_name', 'estimated_value', 'confidence_score', 'ai_analysis', 'listing_draft', 'similar_listings']
            missing_fields = [field for field in required_fields if field not in scan_data]
            
            if missing_fields:
                print(f"   ❌ Missing required fields: {missing_fields}")
                return False
            else:
                print(f"   ✅ All required fields present")
            
        else:
            print(f"   ❌ Scan failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Scan error: {str(e)}")
        return False
    
    # Step 2: Test GET /api/history with same userId
    print(f"\n📥 STEP 2: Testing GET /api/history with userId: '{test_user_id}'...")
    
    try:
        print("   Retrieving scan history...")
        response = requests.get(f"{API_BASE}/history?user_id={test_user_id}", timeout=10)
        
        if response.status_code == 200:
            history_data = response.json()
            
            print(f"   ✅ History retrieved successfully!")
            print(f"   - Total scans: {len(history_data)}")
            
            # Check if our scan is in the history
            found_scan = None
            for scan in history_data:
                if scan.get('id') == scan_id:
                    found_scan = scan
                    break
            
            if found_scan:
                print(f"   ✅ New scan found in history!")
                print(f"   - Scan ID matches: {found_scan.get('id') == scan_id}")
                print(f"   - User ID matches: {found_scan.get('user_id') == test_user_id}")
            else:
                print(f"   ❌ New scan NOT found in history!")
                return False
                
        else:
            print(f"   ❌ History retrieval failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ History error: {str(e)}")
        return False
    
    # Step 3: Test GET /api/scan/{id} for individual scan retrieval
    print(f"\n🎯 STEP 3: Testing GET /api/scan/{scan_id} for individual retrieval...")
    
    try:
        print("   Retrieving individual scan...")
        response = requests.get(f"{API_BASE}/scan/{scan_id}", timeout=10)
        
        if response.status_code == 200:
            individual_data = response.json()
            
            print(f"   ✅ Individual scan retrieved successfully!")
            print(f"   - Scan ID matches: {individual_data.get('id') == scan_id}")
            print(f"   - User ID matches: {individual_data.get('user_id') == test_user_id}")
            print(f"   - Has image data: {'Yes' if individual_data.get('image_base64') else 'No'}")
            print(f"   - Has AI analysis: {'Yes' if individual_data.get('ai_analysis') else 'No'}")
            
        else:
            print(f"   ❌ Individual scan retrieval failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"   ❌ Individual scan error: {str(e)}")
        return False
    
    print(f"\n🎉 COMPLETE SCAN FLOW TEST - ALL STEPS PASSED!")
    print("="*60)
    print("✅ POST /api/scan accepts userId and processes successfully")
    print("✅ Full AI pipeline works with userId")
    print("✅ Scan is saved to database with correct user_id")
    print("✅ Response includes all required fields for frontend display")
    print("✅ Scan appears in GET /api/history?user_id=<same_user>")
    print("✅ Individual scan retrieval works correctly")
    
    return True

def test_userid_validation():
    """Test userId parameter validation"""
    
    print(f"\n🔒 TESTING userId PARAMETER VALIDATION")
    print("="*60)
    
    test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA4GgKxQAAAABJRU5ErkJggg=="
    
    # Test 1: Missing userId (should fail)
    print("\n📋 Test 1: Missing userId parameter (should return HTTP 400)...")
    payload_no_userid = {
        "imageBase64": test_image_base64,
        "countryCode": "US",
        "currencyCode": "USD"
    }
    
    try:
        response = requests.post(f"{API_BASE}/scan", json=payload_no_userid, timeout=30)
        if response.status_code == 400:
            print("   ✅ Missing userId correctly rejected with HTTP 400")
        else:
            print(f"   ❌ Expected HTTP 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False
    
    # Test 2: Empty userId (should fail)
    print("\n📋 Test 2: Empty userId parameter (should return HTTP 400)...")
    payload_empty_userid = {
        "imageBase64": test_image_base64,
        "countryCode": "US",
        "currencyCode": "USD",
        "userId": ""
    }
    
    try:
        response = requests.post(f"{API_BASE}/scan", json=payload_empty_userid, timeout=30)
        if response.status_code == 400:
            print("   ✅ Empty userId correctly rejected with HTTP 400")
        else:
            print(f"   ❌ Expected HTTP 400, got {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
        return False
    
    print(f"\n✅ userId VALIDATION TESTS PASSED!")
    return True

if __name__ == "__main__":
    print("🚀 Starting Focused Scan Test for userId Parameter Fix")
    
    # Test 1: userId validation
    validation_ok = test_userid_validation()
    
    # Test 2: Complete scan flow
    flow_ok = test_complete_scan_flow()
    
    print(f"\n{'='*80}")
    print("🎯 FINAL RESULTS")
    print(f"{'='*80}")
    print(f"✅ userId Validation: {'PASS' if validation_ok else 'FAIL'}")
    print(f"✅ Complete Scan Flow: {'PASS' if flow_ok else 'FAIL'}")
    
    if validation_ok and flow_ok:
        print(f"\n🎉 ALL TESTS PASSED!")
        print("The scanning mechanism is working correctly after privacy fixes.")
        print("Users can successfully scan items with userId parameter.")
        exit(0)
    else:
        print(f"\n💥 SOME TESTS FAILED!")
        print("The scanning mechanism has issues that need to be addressed.")
        exit(1)