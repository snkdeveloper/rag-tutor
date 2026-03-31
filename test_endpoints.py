#!/usr/bin/env python3
"""
Test script to verify authentication and file upload endpoints.
"""

import requests
import json
from pathlib import Path
import tempfile
import time

BASE_URL = "http://localhost:8000"

def test_auth_flow():
    """Test signup, signin, and upload flow."""
    print("\n=== Testing Authentication and Upload Flow ===\n")
    
    # 1. Signup as teacher
    print("1. Testing teacher signup...")
    signup_data = {
        "name": "Mr. Smith",
        "email": "teacher@example.com",
        "password": "teacher123",
        "role": "teacher"
    }
    
    response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        token = response.json()["access_token"]
        print(f"   ✓ Teacher signup successful! Token: {token[:20]}...")
    else:
        print(f"   ✗ Signup failed: {response.json()}")
        return None
    
    # 2. Test file upload
    print("\n2. Testing file upload...")
    
    # Create a test file in system temp directory
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
        f.write("This is a test document for the RAG system.\n\nIt contains multiple paragraphs.\n\nThis is the third paragraph.")
        test_file_path = f.name
    
    headers = {
        "Authorization": f"Bearer {token}"
    }
    
    with open(test_file_path, "rb") as f:
        files = {"file": ("test_document.txt", f, "text/plain")}
        response = requests.post(f"{BASE_URL}/upload", files=files, headers=headers)
    
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("   ✓ File upload successful!")
    else:
        print(f"   ✗ Upload failed: {response.json()}")
    
    # 3. Test documents listing
    print("\n3. Testing documents listing...")
    response = requests.get(f"{BASE_URL}/documents", headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("   ✓ Documents listing successful!")
    else:
        print(f"   ✗ Listing failed: {response.json()}")
    
    # 4. Test chat endpoint
    print("\n4. Testing chat endpoint...")
    chat_data = {
        "question": "What is the test document about?"
    }
    
    response = requests.post(f"{BASE_URL}/chat", json=chat_data, headers=headers)
    print(f"   Status: {response.status_code}")
    print(f"   Response: {json.dumps(response.json(), indent=2)}")
    
    if response.status_code == 200:
        print("   ✓ Chat successful!")
    else:
        print(f"   ✗ Chat failed: {response.json()}")
    
    # 5. Test student access (should fail for upload)
    print("\n5. Testing student access restrictions...")
    print("   5a. Creating student account...")
    
    student_data = {
        "name": "John Student",
        "email": "student@example.com",
        "password": "student123",
        "role": "student"
    }
    
    response = requests.post(f"{BASE_URL}/auth/signup", json=student_data)
    if response.status_code == 200:
        student_token = response.json()["access_token"]
        print(f"   ✓ Student account created!")
        
        # Try to upload as student (should fail)
        print("   5b. Testing student upload attempt (should be rejected)...")
        student_headers = {"Authorization": f"Bearer {student_token}"}
        
        with open(test_file_path, "rb") as f:
            files = {"file": ("test_document2.txt", f, "text/plain")}
            response = requests.post(f"{BASE_URL}/upload", files=files, headers=student_headers)
        
        print(f"   Status: {response.status_code}")
        print(f"   Response: {json.dumps(response.json(), indent=2)}")
        
        if response.status_code == 403:
            print("   ✓ Student correctly denied upload access!")
        else:
            print(f"   ✗ Unexpected response for student upload")
    else:
        print(f"   ✗ Student signup failed: {response.json()}")
    
    print("\n=== Test Complete ===\n")

if __name__ == "__main__":
    print("Waiting for backend to be ready...")
    for i in range(5):
        try:
            response = requests.get(f"{BASE_URL}/docs")
            if response.status_code == 200:
                print("✓ Backend is ready!")
                break
        except:
            print(f"  Attempt {i+1}/5: Backend not ready yet...")
            time.sleep(2)
    
    test_auth_flow()
