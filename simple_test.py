#!/usr/bin/env python3
"""Simple test to verify backend connectivity."""

import requests
import json
import sys

BASE_URL = "http://localhost:8000"

try:
    # Test connectivity
    print("Testing backend connectivity...")
    response = requests.get(f"{BASE_URL}/docs", timeout=5)
    print(f"✓ Backend responded with status {response.status_code}")
    
    # Test signup
    print("\nTesting signup endpoint...")
    signup_data = {
        "name": "Test Teacher",
        "email": "teacher@test.com",
        "password": "password123",
        "role": "teacher"
    }
    
    response = requests.post(
        f"{BASE_URL}/auth/signup", 
        json=signup_data, 
        timeout=10
    )
    print(f"Signup status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✓ Signup successful!")
        print(f"  User: {data['user']}")
        print(f"  Token: {data['access_token'][:30]}...")
    else:
        print(f"✗ Signup failed: {response.text}")
        sys.exit(1)
        
except requests.exceptions.ConnectionError as e:
    print(f"✗ Connection failed: {e}")
    print(f"  Is the backend running on {BASE_URL}?")
    sys.exit(1)
except Exception as e:
    print(f"✗ Error: {e}")
    sys.exit(1)

print("\n✓ Basic tests passed!")
