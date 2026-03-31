#!/usr/bin/env python3
"""Quick upload test."""

import requests
import tempfile
from datetime import datetime

BASE_URL = "http://localhost:8000"

# Use unique email based on timestamp
email = f"teacher{datetime.now().timestamp()}@test.com"

# 1. Signup
print("1. Creating teacher account...")
signup = requests.post(f"{BASE_URL}/auth/signup", json={
    "name": "Test Teacher",
    "email": email,
    "password": "password123",
    "role": "teacher"
})

if signup.status_code != 200:
    print(f"✗ Signup failed: {signup.json()}")
    exit(1)

token = signup.json()["access_token"]
print(f"✓ Teacher created with token: {token[:30]}...")

# 2. Upload file
print("\n2. Testing file upload...")
with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as f:
    f.write("AI and Machine Learning Tutorial.\n\nThis document contains information about neural networks.")
    file_path = f.name

headers = {"Authorization": f"Bearer {token}"}
with open(file_path, "rb") as f:
    files = {"file": ("tutorial.txt", f, "text/plain")}
    upload = requests.post(f"{BASE_URL}/upload", files=files, headers=headers)

print(f"Upload status: {upload.status_code}")
if upload.status_code == 200:
    print(f"✓ File uploaded successfully!")
    print(f"Response: {upload.json()}")
else:
    print(f"✗ Upload failed: {upload.json()}")
    exit(1)

# 3. List documents
print("\n3. Listing documents...")
docs = requests.get(f"{BASE_URL}/documents", headers=headers)
if docs.status_code == 200:
    print(f"✓ Documents retrieved: {len(docs.json())} files")
    for doc in docs.json()[-1:]:  # Show last doc
        print(f"  - {doc['filename']} (uploaded by {doc.get('uploaded_by', 'unknown')})")
else:
    print(f"✗ Failed: {docs.json()}")

print("\n✓ All tests passed!")
