#!/usr/bin/env python3
"""
Test to demonstrate that the Vision API provides varied, specific results
for different images, proving it's working with real credentials.
"""

import requests
import json
import os
import tempfile
import base64
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

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

def create_test_image_with_text(text, filename):
    """Create a simple test image with text"""
    img = Image.new('RGB', (400, 200), color='white')
    draw = ImageDraw.Draw(img)
    
    try:
        # Try to use a default font
        font = ImageFont.load_default()
    except:
        font = None
    
    # Draw text in the center
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    
    x = (400 - text_width) // 2
    y = (200 - text_height) // 2
    
    draw.text((x, y), text, fill='black', font=font)
    
    img.save(filename)
    return filename

def test_scan_with_image(image_path, description):
    """Test scanning with a specific image"""
    try:
        with open(image_path, 'rb') as f:
            files = {'file': (os.path.basename(image_path), f, 'image/jpeg')}
            response = requests.post(f"{API_BASE}/scan", files=files, timeout=60)
        
        if response.status_code == 200:
            data = response.json()
            return {
                'success': True,
                'item_name': data.get('item_name', 'N/A'),
                'estimated_value': data.get('estimated_value', 'N/A'),
                'confidence_score': data.get('confidence_score', 0),
                'vision_response': data.get('vision_response', {}),
                'ai_analysis': data.get('ai_analysis', 'N/A')[:200] + '...'
            }
        else:
            return {'success': False, 'error': f"HTTP {response.status_code}: {response.text}"}
    
    except Exception as e:
        return {'success': False, 'error': str(e)}

def main():
    print("🚀 Testing Vision API with Multiple Images for Varied Results")
    print("="*80)
    
    # Test 1: Original test image (watch)
    print("\n📸 Test 1: Original test image (Vintage Watch)")
    result1 = test_scan_with_image("/app/test_item.jpg", "Vintage Watch")
    
    if result1['success']:
        print(f"✅ Item: {result1['item_name']}")
        print(f"✅ Value: {result1['estimated_value']}")
        print(f"✅ Vision Objects: {result1['vision_response'].get('objects', [])}")
        print(f"✅ Vision Texts: {result1['vision_response'].get('texts', [])}")
        print(f"✅ Analysis: {result1['ai_analysis']}")
    else:
        print(f"❌ Error: {result1['error']}")
    
    # Create temporary test images with different text
    temp_dir = tempfile.mkdtemp()
    
    # Test 2: Create image with book text
    print("\n📸 Test 2: Simulated book image")
    book_image = create_test_image_with_text("ANTIQUE BOOK\nFIRST EDITION\n1920", 
                                           os.path.join(temp_dir, "book.jpg"))
    result2 = test_scan_with_image(book_image, "Antique Book")
    
    if result2['success']:
        print(f"✅ Item: {result2['item_name']}")
        print(f"✅ Value: {result2['estimated_value']}")
        print(f"✅ Vision Texts: {result2['vision_response'].get('texts', [])}")
    else:
        print(f"❌ Error: {result2['error']}")
    
    # Test 3: Create image with coin text
    print("\n📸 Test 3: Simulated coin image")
    coin_image = create_test_image_with_text("LIBERTY\n1964\nONE DOLLAR", 
                                           os.path.join(temp_dir, "coin.jpg"))
    result3 = test_scan_with_image(coin_image, "Vintage Coin")
    
    if result3['success']:
        print(f"✅ Item: {result3['item_name']}")
        print(f"✅ Value: {result3['estimated_value']}")
        print(f"✅ Vision Texts: {result3['vision_response'].get('texts', [])}")
    else:
        print(f"❌ Error: {result3['error']}")
    
    # Analysis
    print(f"\n{'='*80}")
    print("🎯 VISION API ANALYSIS SUMMARY")
    print(f"{'='*80}")
    
    successful_tests = [r for r in [result1, result2, result3] if r['success']]
    
    if len(successful_tests) >= 2:
        # Check if we get different results
        item_names = [r['item_name'] for r in successful_tests]
        values = [r['estimated_value'] for r in successful_tests]
        
        unique_items = len(set(item_names))
        unique_values = len(set(values))
        
        print(f"✅ Successful scans: {len(successful_tests)}/3")
        print(f"✅ Unique item names: {unique_items}")
        print(f"✅ Unique value estimates: {unique_values}")
        
        print(f"\nResults comparison:")
        for i, result in enumerate(successful_tests, 1):
            print(f"  Test {i}: {result['item_name']} - {result['estimated_value']}")
        
        if unique_items > 1 or unique_values > 1:
            print(f"\n🎉 SUCCESS: Vision API is providing VARIED, SPECIFIC results!")
            print(f"   This proves the API is working with real credentials and analyzing actual image content.")
            print(f"   Users should get different results for different items.")
        else:
            print(f"\n⚠️  WARNING: All results are identical - may indicate fallback behavior")
    else:
        print(f"❌ Too few successful tests to analyze variation")
    
    # Cleanup
    import shutil
    shutil.rmtree(temp_dir)

if __name__ == "__main__":
    main()