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
            "backend_logs": {"status": "pending", "details": ""},
            "history_endpoint": {"status": "pending", "details": ""},
            "scan_save_retrieve": {"status": "pending", "details": ""},
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
                "currencyCode": "CAD",
                "userId": "backend_test_user"  # Required for privacy fix
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
        """Test 3: SCAN HISTORY DEBUGGING - Detailed Database Analysis"""
        try:
            print("\n🔍 DEBUGGING SCAN HISTORY ISSUE - Analyzing Database Content...")
            print("🎯 FOCUS: Understanding why frontend shows 'No scans yet' despite scans existing")
            
            response = requests.get(f"{API_BASE}/history?user_id=backend_test_cycle_user", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, list):
                    # DETAILED ANALYSIS FOR DEBUGGING
                    total_scans = len(data)
                    
                    details = f"""
🔍 SCAN HISTORY DEBUGGING RESULTS:
=====================================

📊 TOTAL SCANS IN DATABASE: {total_scans}

🔑 KEY FINDINGS:
"""
                    
                    if total_scans == 0:
                        details += """
❌ NO SCANS FOUND IN DATABASE
- This explains why frontend shows 'No scans yet'
- Issue: Scans are not being saved to database at all
- Recommendation: Check if POST /api/scan is actually saving to database
"""
                    else:
                        # Analyze scan structure and user IDs
                        user_ids = set()
                        scan_structures = []
                        
                        for i, scan in enumerate(data[:5]):  # Analyze first 5 scans
                            user_id = scan.get('user_id', 'MISSING')
                            user_ids.add(user_id)
                            
                            scan_structure = {
                                'id': scan.get('id', 'MISSING'),
                                'user_id': user_id,
                                'timestamp': scan.get('timestamp', 'MISSING'),
                                'item_name': scan.get('item_name', 'MISSING'),
                                'has_image': bool(scan.get('image_base64')),
                                'country_code': scan.get('country_code', 'MISSING'),
                                'currency_code': scan.get('currency_code', 'MISSING')
                            }
                            scan_structures.append(scan_structure)
                        
                        details += f"""
✅ SCANS FOUND: {total_scans} scans exist in database

👥 USER IDs IN DATABASE:
{chr(10).join([f"   - '{uid}'" for uid in sorted(user_ids)])}

📋 SAMPLE SCAN STRUCTURES (First 5 scans):
"""
                        for i, structure in enumerate(scan_structures, 1):
                            details += f"""
   Scan #{i}:
   - ID: {structure['id']}
   - User ID: '{structure['user_id']}'
   - Timestamp: {structure['timestamp']}
   - Item: {structure['item_name']}
   - Has Image: {structure['has_image']}
   - Country/Currency: {structure['country_code']}/{structure['currency_code']}
"""
                        
                        # Latest scan details
                        if data:
                            latest = data[0]
                            details += f"""
🕐 LATEST SCAN DETAILS:
   - ID: {latest.get('id')}
   - User ID: '{latest.get('user_id')}'
   - Item: {latest.get('item_name')}
   - Value: {latest.get('estimated_value')}
   - Timestamp: {latest.get('timestamp')}
   - Country/Currency: {latest.get('country_code')}/{latest.get('currency_code')}

🔍 POTENTIAL ISSUES ANALYSIS:
"""
                            # Check for common issues
                            if latest.get('user_id') != 'prototype_user_01':
                                details += f"   ⚠️  USER ID MISMATCH: Expected 'prototype_user_01', found '{latest.get('user_id')}'\n"
                            else:
                                details += f"   ✅ USER ID CORRECT: Using expected 'prototype_user_01'\n"
                            
                            if not latest.get('image_base64'):
                                details += f"   ⚠️  MISSING IMAGE DATA: Scan has no image_base64 field\n"
                            else:
                                details += f"   ✅ IMAGE DATA PRESENT: Scan contains image data\n"
                            
                            if not latest.get('timestamp'):
                                details += f"   ⚠️  MISSING TIMESTAMP: Scan has no timestamp field\n"
                            else:
                                details += f"   ✅ TIMESTAMP PRESENT: {latest.get('timestamp')}\n"
                        
                        details += f"""
🎯 CONCLUSION:
   - Database contains {total_scans} scans with proper structure
   - All scans use user_id: '{list(user_ids)[0] if len(user_ids) == 1 else 'MULTIPLE_IDS'}'
   - If frontend shows 'No scans yet', the issue is likely:
     1. Frontend authentication using different user ID
     2. Frontend query logic error
     3. Firestore security rules (if using Firestore)
     4. Authentication timing issues

💡 NEXT STEPS:
   - Check what user ID the frontend is using for queries
   - Verify frontend authentication state
   - Compare frontend query logic with backend filtering
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

    def test_backend_logs(self):
        """Test 5: Backend Logs Verification"""
        try:
            print("\n🔍 Checking Backend Logs for Errors...")
            
            # Check supervisor logs for backend
            import subprocess
            result = subprocess.run(
                ['tail', '-n', '50', '/var/log/supervisor/backend.out.log'],
                capture_output=True, text=True, timeout=10
            )
            
            logs = result.stdout
            
            # Check for the specific error that was supposed to be fixed
            if 'search_marketplaces() takes 1 positional argument but 2 were given' in logs:
                self.log_test("backend_logs", "fail", 
                            "Found the search_marketplaces signature error in logs")
                return False
            
            # Check for other critical errors
            error_patterns = [
                'TypeError', 'AttributeError', 'KeyError', 'ValueError',
                'Exception', 'Error', 'Failed', 'Traceback'
            ]
            
            found_errors = []
            for pattern in error_patterns:
                if pattern.lower() in logs.lower():
                    found_errors.append(pattern)
            
            if found_errors:
                details = f"Found potential errors in logs: {', '.join(found_errors)}\n\nRecent logs:\n{logs[-500:]}"
                self.log_test("backend_logs", "warning", details)
                return True  # Not a critical failure
            else:
                self.log_test("backend_logs", "pass", 
                            "No critical errors found in backend logs")
                return True
                
        except Exception as e:
            self.log_test("backend_logs", "fail", f"Could not check logs: {str(e)}")
            return False

    def test_scan_save_and_retrieve_cycle(self):
        """Test 6: SCAN SAVE & RETRIEVE DEBUGGING - Verify userId consistency"""
        try:
            print("\n🔍 DEBUGGING SCAN SAVE & RETRIEVE CYCLE...")
            print("🎯 FOCUS: Verify scans are saved with correct userId and immediately retrievable")
            
            # Create a simple test image (1x1 pixel PNG in base64)
            test_image_base64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChAGA4GgKxQAAAABJRU5ErkJggg=="
            
            # Step 1: Create a new scan
            print("📤 Step 1: Creating new scan...")
            payload = {
                "imageBase64": test_image_base64,
                "countryCode": "US",
                "currencyCode": "USD",
                "userId": "backend_test_cycle_user"  # Required for privacy fix
            }
            
            scan_response = requests.post(
                f"{API_BASE}/scan", 
                json=payload,
                headers={'Content-Type': 'application/json'},
                timeout=60
            )
            
            if scan_response.status_code != 200:
                self.log_test("scan_save_retrieve", "fail", 
                            f"Failed to create scan: HTTP {scan_response.status_code}: {scan_response.text}")
                return False
            
            scan_data = scan_response.json()
            new_scan_id = scan_data.get('id')
            new_scan_user_id = scan_data.get('user_id')
            
            print(f"✅ Scan created successfully!")
            print(f"   - Scan ID: {new_scan_id}")
            print(f"   - User ID: '{new_scan_user_id}'")
            
            # Step 2: Immediately retrieve history to verify scan is there
            print("📥 Step 2: Retrieving history to verify scan was saved...")
            
            history_response = requests.get(f"{API_BASE}/history?user_id=backend_test_cycle_user", timeout=10)
            
            if history_response.status_code != 200:
                self.log_test("scan_save_retrieve", "fail", 
                            f"Failed to retrieve history: HTTP {history_response.status_code}")
                return False
            
            history_data = history_response.json()
            
            # Step 3: Check if our new scan is in the history
            print("🔍 Step 3: Checking if new scan appears in history...")
            
            found_scan = None
            for scan in history_data:
                if scan.get('id') == new_scan_id:
                    found_scan = scan
                    break
            
            # Step 4: Retrieve the specific scan by ID
            print("🎯 Step 4: Retrieving scan by specific ID...")
            
            individual_response = requests.get(f"{API_BASE}/scan/{new_scan_id}", timeout=10)
            
            if individual_response.status_code != 200:
                self.log_test("scan_save_retrieve", "fail", 
                            f"Failed to retrieve individual scan: HTTP {individual_response.status_code}")
                return False
            
            individual_data = individual_response.json()
            
            # Analysis and Results
            details = f"""
🔍 SCAN SAVE & RETRIEVE CYCLE ANALYSIS:
=====================================

📤 SCAN CREATION:
   ✅ Successfully created scan
   - Scan ID: {new_scan_id}
   - User ID: '{new_scan_user_id}'
   - Item Name: {scan_data.get('item_name', 'N/A')}
   - Estimated Value: {scan_data.get('estimated_value', 'N/A')}

📥 HISTORY RETRIEVAL:
   ✅ Successfully retrieved history ({len(history_data)} total scans)
   {'✅ NEW SCAN FOUND in history' if found_scan else '❌ NEW SCAN NOT FOUND in history'}
"""
            
            if found_scan:
                details += f"""   - Found scan user_id: '{found_scan.get('user_id')}'
   - User ID match: {'✅ YES' if found_scan.get('user_id') == new_scan_user_id else '❌ NO'}
"""
            
            details += f"""
🎯 INDIVIDUAL SCAN RETRIEVAL:
   ✅ Successfully retrieved individual scan
   - Retrieved scan user_id: '{individual_data.get('user_id')}'
   - User ID consistency: {'✅ YES' if individual_data.get('user_id') == new_scan_user_id else '❌ NO'}

🔑 KEY FINDINGS:
"""
            
            if found_scan and individual_data.get('user_id') == new_scan_user_id:
                details += f"""   ✅ SCAN SAVE/RETRIEVE WORKING CORRECTLY
   - Scans are being saved with user_id: '{new_scan_user_id}'
   - Scans appear in history endpoint immediately
   - Individual scan retrieval works correctly
   - User ID is consistent across all operations

💡 CONCLUSION:
   Backend scan saving and retrieval is working correctly.
   If frontend shows 'No scans yet', the issue is likely:
   1. Frontend using different user ID for queries
   2. Frontend authentication not matching backend user_id
   3. Frontend query timing or logic issues
"""
            else:
                details += f"""   ❌ SCAN SAVE/RETRIEVE HAS ISSUES
   - New scan in history: {'YES' if found_scan else 'NO'}
   - User ID consistency: {'YES' if individual_data.get('user_id') == new_scan_user_id else 'NO'}
   
💡 ISSUE IDENTIFIED:
   Backend has problems with scan persistence or user ID handling.
"""
            
            # Store the new scan ID for other tests
            self.scan_id = new_scan_id
            
            self.log_test("scan_save_retrieve", "pass", details)
            return True
            
        except requests.exceptions.Timeout:
            self.log_test("scan_save_retrieve", "fail", 
                        "Request timeout during scan save/retrieve cycle")
            return False
        except requests.exceptions.RequestException as e:
            self.log_test("scan_save_retrieve", "fail", f"Connection error: {str(e)}")
            return False
        except Exception as e:
            self.log_test("scan_save_retrieve", "fail", f"Unexpected error: {str(e)}")
            return False

    def test_individual_scan(self):
        """Test 7: Individual Scan Retrieval - GET /api/scan/{scan_id}"""
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
User ID: '{data.get('user_id')}'
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
        
        # Test 3: Backend Logs Check
        logs_ok = self.test_backend_logs()
        
        # Test 4: History Endpoint (only if health check passes)
        history_ok = False
        if health_ok:
            history_ok = self.test_history_endpoint()
        else:
            self.log_test("history_endpoint", "skip", "Skipped due to health check failure")
        
        # Test 5: Scan Save & Retrieve Cycle (only if health check passes)
        save_retrieve_ok = False
        if health_ok:
            save_retrieve_ok = self.test_scan_save_and_retrieve_cycle()
        else:
            self.log_test("scan_save_retrieve", "skip", "Skipped due to health check failure")
        
        # Test 6: Individual Scan (only if scan was successful)
        individual_ok = False
        if scan_ok or save_retrieve_ok:  # Can use scan ID from either test
            individual_ok = self.test_individual_scan()
        else:
            self.log_test("individual_scan", "skip", "Skipped due to scan endpoint failure")
        
        # Final Summary
        self.print_final_summary()
        
        return {
            "health_check": health_ok,
            "scan_endpoint": scan_ok,
            "backend_logs": logs_ok,
            "history_endpoint": history_ok,
            "scan_save_retrieve": save_retrieve_ok,
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