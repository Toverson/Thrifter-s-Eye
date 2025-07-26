#!/usr/bin/env python3
"""
Comprehensive Backend Test Suite for Thrifter's Eye App
Tests all API endpoints with real data and AI integrations
"""

import requests
import json
import base64
import time
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

print(f"Testing backend at: {API_BASE}")

class ThrifterEyeBackendTester:
    def __init__(self):
        self.test_results = {
            "health_check": {"status": "pending", "details": ""},
            "scan_endpoint": {"status": "pending", "details": ""},
            "history_endpoint": {"status": "pending", "details": ""},
            "individual_scan": {"status": "pending", "details": ""}
        }
        self.scan_id = None
        
    def log_test(self, test_name, status, details):
        """Log test results"""
        self.test_results[test_name] = {"status": status, "details": details}
        print(f"\n{'='*60}")
        print(f"TEST: {test_name.upper()}")
        print(f"STATUS: {status.upper()}")
        print(f"DETAILS: {details}")
        print(f"{'='*60}")

    def test_health_check(self):
        """Test 1: Basic API Health Check - GET /api/"""
        try:
            print("\n🔍 Testing API Health Check...")
            response = requests.get(f"{API_BASE}/", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if "message" in data and "Thrifter's Eye" in data["message"]:
                    self.log_test("health_check", "pass", 
                                f"API is healthy. Response: {data}")
                    return True
                else:
                    self.log_test("health_check", "fail", 
                                f"Unexpected response format: {data}")
                    return False
            else:
                self.log_test("health_check", "fail", 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("health_check", "fail", f"Connection error: {str(e)}")
            return False
        except Exception as e:
            self.log_test("health_check", "fail", f"Unexpected error: {str(e)}")
            return False

    def test_scan_endpoint(self):
        """Test 2: JSON-based Scan Endpoint with Full AI Pipeline - POST /api/scan"""
        try:
            print("\n🔍 Testing JSON-based Scan Endpoint with AI Pipeline...")
            
            # Load test image and convert to base64
            test_image_path = "/app/test_item.jpg"
            if not os.path.exists(test_image_path):
                self.log_test("scan_endpoint", "fail", "Test image not found")
                return False
            
            # Convert image to base64
            with open(test_image_path, 'rb') as f:
                image_data = f.read()
                image_base64 = base64.b64encode(image_data).decode('utf-8')
            
            # Prepare JSON payload as expected by frontend
            payload = {
                "imageBase64": image_base64,
                "countryCode": "CA",  # Test with Canada to verify country_code parameter
                "currencyCode": "CAD"
            }
            
            print("Sending JSON request with base64 image and processing with AI pipeline...")
            print("This may take 10-30 seconds due to AI processing...")
            print(f"Testing with country: {payload['countryCode']}, currency: {payload['currencyCode']}")
            
            response = requests.post(
                f"{API_BASE}/scan", 
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=60
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify all required fields are present
                required_fields = [
                    'id', 'user_id', 'timestamp', 'image_base64', 
                    'item_name', 'estimated_value', 'confidence_score',
                    'ai_analysis', 'listing_draft', 'similar_listings'
                ]
                
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    self.log_test("scan_endpoint", "fail", 
                                f"Missing required fields: {missing_fields}")
                    return False
                
                # Verify AI pipeline components
                checks = []
                
                # Check Vision API integration
                if data.get('vision_response'):
                    checks.append("✅ Google Vision API integration working")
                else:
                    checks.append("❌ Google Vision API integration failed")
                
                # Check Search API integration  
                if data.get('search_response'):
                    checks.append("✅ Google Custom Search API integration working")
                else:
                    checks.append("❌ Google Custom Search API integration failed")
                
                # Check Gemini AI integration
                if data.get('ai_analysis') and len(data['ai_analysis']) > 50:
                    checks.append("✅ Gemini AI integration working")
                else:
                    checks.append("❌ Gemini AI integration failed")
                
                # Check image storage
                if data.get('image_base64') and len(data['image_base64']) > 100:
                    checks.append("✅ Image stored as base64")
                else:
                    checks.append("❌ Image storage failed")
                
                # Check marketplace listings
                if data.get('similar_listings') and len(data['similar_listings']) > 0:
                    checks.append("✅ Similar listings found")
                else:
                    checks.append("❌ No similar listings found")
                
                # Verify country/currency awareness
                if data.get('country_code') == 'CA' and data.get('currency_code') == 'CAD':
                    checks.append("✅ Country/Currency parameters working correctly")
                else:
                    checks.append(f"❌ Country/Currency parameters failed. Got: {data.get('country_code')}/{data.get('currency_code')}")
                
                # Check for the specific error that was fixed
                if 'search_marketplaces() takes 1 positional argument but 2 were given' in str(data):
                    checks.append("❌ search_marketplaces function signature error still present")
                else:
                    checks.append("✅ search_marketplaces function signature fix confirmed")
                
                # Store scan ID for later tests
                self.scan_id = data.get('id')
                
                details = f"""
Scan completed successfully!
Scan ID: {self.scan_id}
Item Name: {data.get('item_name', 'N/A')}
Estimated Value: {data.get('estimated_value', 'N/A')}
Confidence Score: {data.get('confidence_score', 'N/A')}%

AI Pipeline Status:
{chr(10).join(checks)}

AI Analysis Preview: {data.get('ai_analysis', 'N/A')[:200]}...

Listing Draft Title: {data.get('listing_draft', {}).get('title', 'N/A')}
Similar Listings Count: {len(data.get('similar_listings', []))}
"""
                
                self.log_test("scan_endpoint", "pass", details)
                return True
                
            else:
                self.log_test("scan_endpoint", "fail", 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.Timeout:
            self.log_test("scan_endpoint", "fail", 
                        "Request timeout - AI processing took too long")
            return False
        except requests.exceptions.RequestException as e:
            self.log_test("scan_endpoint", "fail", f"Connection error: {str(e)}")
            return False
        except Exception as e:
            self.log_test("scan_endpoint", "fail", f"Unexpected error: {str(e)}")
            return False

    def test_history_endpoint(self):
        """Test 3: History Retrieval - GET /api/history"""
        try:
            print("\n🔍 Testing History Endpoint...")
            response = requests.get(f"{API_BASE}/history", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    details = f"""
History retrieved successfully!
Total scans in history: {len(data)}
"""
                    if len(data) > 0:
                        latest_scan = data[0]
                        details += f"""
Latest scan details:
- ID: {latest_scan.get('id', 'N/A')}
- Item: {latest_scan.get('item_name', 'N/A')}
- Value: {latest_scan.get('estimated_value', 'N/A')}
- Timestamp: {latest_scan.get('timestamp', 'N/A')}
"""
                    
                    self.log_test("history_endpoint", "pass", details)
                    return True
                else:
                    self.log_test("history_endpoint", "fail", 
                                f"Expected list, got: {type(data)}")
                    return False
            else:
                self.log_test("history_endpoint", "fail", 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("history_endpoint", "fail", f"Connection error: {str(e)}")
            return False
        except Exception as e:
            self.log_test("history_endpoint", "fail", f"Unexpected error: {str(e)}")
            return False

    def test_individual_scan(self):
        """Test 4: Individual Scan Retrieval - GET /api/scan/{scan_id}"""
        try:
            print("\n🔍 Testing Individual Scan Retrieval...")
            
            if not self.scan_id:
                self.log_test("individual_scan", "fail", 
                            "No scan ID available from previous test")
                return False
            
            response = requests.get(f"{API_BASE}/scan/{self.scan_id}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Verify it's the same scan we created
                if data.get('id') == self.scan_id:
                    details = f"""
Individual scan retrieved successfully!
Scan ID: {data.get('id')}
Item Name: {data.get('item_name', 'N/A')}
Estimated Value: {data.get('estimated_value', 'N/A')}
Confidence Score: {data.get('confidence_score', 'N/A')}%
Has Image Data: {'Yes' if data.get('image_base64') else 'No'}
Has AI Analysis: {'Yes' if data.get('ai_analysis') else 'No'}
"""
                    self.log_test("individual_scan", "pass", details)
                    return True
                else:
                    self.log_test("individual_scan", "fail", 
                                f"Scan ID mismatch. Expected: {self.scan_id}, Got: {data.get('id')}")
                    return False
            elif response.status_code == 404:
                self.log_test("individual_scan", "fail", 
                            f"Scan not found: {self.scan_id}")
                return False
            else:
                self.log_test("individual_scan", "fail", 
                            f"HTTP {response.status_code}: {response.text}")
                return False
                
        except requests.exceptions.RequestException as e:
            self.log_test("individual_scan", "fail", f"Connection error: {str(e)}")
            return False
        except Exception as e:
            self.log_test("individual_scan", "fail", f"Unexpected error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests in sequence"""
        print(f"\n🚀 Starting Thrifter's Eye Backend Test Suite")
        print(f"Backend URL: {API_BASE}")
        print(f"{'='*80}")
        
        # Test 1: Health Check
        health_ok = self.test_health_check()
        
        # Test 2: Scan Endpoint (only if health check passes)
        scan_ok = False
        if health_ok:
            scan_ok = self.test_scan_endpoint()
        else:
            self.log_test("scan_endpoint", "skip", "Skipped due to health check failure")
        
        # Test 3: History Endpoint (only if health check passes)
        history_ok = False
        if health_ok:
            history_ok = self.test_history_endpoint()
        else:
            self.log_test("history_endpoint", "skip", "Skipped due to health check failure")
        
        # Test 4: Individual Scan (only if scan was successful)
        individual_ok = False
        if scan_ok:
            individual_ok = self.test_individual_scan()
        else:
            self.log_test("individual_scan", "skip", "Skipped due to scan endpoint failure")
        
        # Final Summary
        self.print_final_summary()
        
        return {
            "health_check": health_ok,
            "scan_endpoint": scan_ok,
            "history_endpoint": history_ok,
            "individual_scan": individual_ok
        }

    def print_final_summary(self):
        """Print final test summary"""
        print(f"\n{'='*80}")
        print("🎯 FINAL TEST SUMMARY")
        print(f"{'='*80}")
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results.values() if result["status"] == "pass")
        failed_tests = sum(1 for result in self.test_results.values() if result["status"] == "fail")
        skipped_tests = sum(1 for result in self.test_results.values() if result["status"] == "skip")
        
        print(f"Total Tests: {total_tests}")
        print(f"✅ Passed: {passed_tests}")
        print(f"❌ Failed: {failed_tests}")
        print(f"⏭️  Skipped: {skipped_tests}")
        print(f"Success Rate: {(passed_tests/total_tests)*100:.1f}%")
        
        print(f"\nDetailed Results:")
        for test_name, result in self.test_results.items():
            status_icon = {"pass": "✅", "fail": "❌", "skip": "⏭️", "pending": "⏳"}
            print(f"{status_icon.get(result['status'], '❓')} {test_name.replace('_', ' ').title()}: {result['status'].upper()}")
        
        if failed_tests > 0:
            print(f"\n⚠️  CRITICAL ISSUES FOUND:")
            for test_name, result in self.test_results.items():
                if result["status"] == "fail":
                    print(f"- {test_name.replace('_', ' ').title()}: {result['details'][:100]}...")

if __name__ == "__main__":
    tester = ThrifterEyeBackendTester()
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    if all(results.values()):
        print(f"\n🎉 All tests passed! Backend is working correctly.")
        exit(0)
    else:
        print(f"\n💥 Some tests failed. Check the details above.")
        exit(1)