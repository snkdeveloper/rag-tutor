# RAG Tutoring System - Authentication & Complete Setup

## Overview

This is a complete end-to-end RAG (Retrieval Augmented Generation) tutoring system with role-based access control for students and teachers.

## Features

### Authentication
- **Student Registration/Login**: Students can create accounts and sign in
- **Teacher Registration/Login**: Teachers can create accounts and sign in
- **JWT Token-Based Auth**: Secure JWT tokens for API authentication
- **Role-Based Access Control (RBAC)**: Different permissions for students and teachers

### Student Features
- Chat with the tutoring system
- Ask questions about course materials
- View uploaded documents metadata

### Teacher Features
- Upload course materials (PDF, TXT, MD)
- Chat with the tutoring system (same as students)
- View all uploaded documents

## Architecture

### Backend (FastAPI)

**New Database Setup:**
- SQLite database for user management (`users.db`)
- User model with fields: email, name, hashed_password, role, created_at
- Users can be either STUDENT or TEACHER

**Authentication Files:**
- `database.py` - Database models and session management
- `jwt_utils.py` - JWT token creation and verification
- `password_utils.py` - Password hashing and verification
- `auth.py` - Authentication dependencies for FastAPI

**API Endpoints:**

```
POST /auth/signup
- Body: { name, email, password, role }
- Returns: { access_token, token_type, user }
- Creates new student/teacher account

POST /auth/signin
- Body: { email, password, role }
- Returns: { access_token, token_type, user }
- Authenticates and returns JWT token

POST /upload
- Headers: Authorization: Bearer <token>
- Body: multipart/form-data with file
- Requires: Teacher role
- Uploads and indexes documents

GET /documents
- Headers: Authorization: Bearer <token>
- Returns: List of uploaded documents
- Requires: Authenticated user (student or teacher)

POST /chat
- Headers: Authorization: Bearer <token>
- Body: { question }
- Returns: { answer, sources }
- Requires: Authenticated user (student or teacher)
```

### Frontend (React)

**New Components:**
- `RoleSelection.js` - First page to choose student/teacher
- `SignUp.js` - Registration with API integration
- `SignIn.js` - Login with API integration
- `AuthContext.js` - Global auth state management

**Updated Components:**
- `App.js` - Role-based routing and JWT integration
- `ChatPage.js` - Sends JWT token with chat requests
- `UploadPage.js` - Sends JWT token with upload requests

## Setup Instructions

### Backend Setup

1. **Install Dependencies:**
```bash
cd backend
pip install -r ../requirements.txt
```

2. **Configure Environment Variables:**
Create `.env` file in backend directory:
```
SECRET_KEY=your-very-secure-random-key-here
TEACHER_SECRET=legacy_teacher_secret
OPENAI_API_KEY=your-openai-key
```

3. **Run Backend:**
```bash
cd backend
uvicorn main:app --reload
```

Backend will run on `http://localhost:8000`

### Frontend Setup

1. **Install Dependencies:**
```bash
cd frontend
npm install
```

2. **Run Frontend:**
```bash
npm start
```

Frontend will run on `http://localhost:3000`

## Authentication Flow

### Sign Up Flow
1. User selects "Student" or "Teacher" on home page
2. Fills in name, email, password
3. Frontend sends POST to `/auth/signup` with role
4. Backend validates, hashes password, creates user
5. Returns JWT token and user data
6. Frontend stores token in localStorage
7. User redirected to their role's page

### Sign In Flow
1. User selects role on home page
2. Enters email and password
3. Frontend sends POST to `/auth/signin` with role
4. Backend verifies credentials
5. Returns JWT token and user data
6. Frontend stores token in localStorage
7. User redirected to their role's page

### API Requests with Authentication
All API requests (except auth) must include:
```
Authorization: Bearer <access_token>
```

## Database Schema

### Users Table
```
email (PRIMARY KEY)      - Unique email address
name                     - User's full name
hashed_password          - Bcrypt hashed password
role                     - "student" or "teacher"
created_at               - Account creation timestamp
```

## Security Features

1. **Password Security**: Bcrypt hashing with salt
2. **JWT Tokens**: Secure token-based authentication
3. **Role-Based Access**: Different permissions for each role
4. **Token Expiration**: 24-hour expiration time
5. **CORS Configuration**: Restricted to frontend origin
6. **Protected Routes**: All sensitive endpoints require auth

## Testing the System

### Create Test Accounts

**Student Account:**
- Email: student@test.com
- Password: password123
- Role: Student

**Teacher Account:**
- Email: teacher@test.com
- Password: password123
- Role: Teacher

### Test Workflow

1. Open http://localhost:3000
2. Choose "Student" role
3. Click "Sign Up"
4. Create account with student@test.com
5. After login, test chat functionality
6. Logout
7. Choose "Teacher" role
8. Sign up with teacher@test.com
9. After login, test both chat and file upload
10. Upload a PDF/TXT/MD file
11. Verify file appears in documents list
12. Go to chat and ask questions about uploaded content

## Troubleshooting

### Database Issues
- If encountering database lock errors, delete `backend/users.db` and restart

### JWT Token Errors
- Ensure `SECRET_KEY` in `.env` is set
- Check that Authorization header format is correct: "Bearer <token>"

### CORS Issues
- Verify frontend runs on http://localhost:3000
- Backend has CORS middleware configured for this origin

### Dependencies Not Found
```bash
# Update pip
pip install --upgrade pip

# Install specific versions if needed
pip install sqlalchemy==2.0.0
pip install pyjwt==2.8.0
pip install bcrypt==4.0.0
pip install passlib==1.7.4
```

## API Testing Tools

Use tools like Postman or cURL to test endpoints:

```bash
# Sign up
curl -X POST http://localhost:8000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@test.com","password":"pass123","role":"student"}'

# Sign in
curl -X POST http://localhost:8000/auth/signin \
  -H "Content-Type: application/json" \
  -d '{"email":"john@test.com","password":"pass123","role":"student"}'

# Chat (with token)
curl -X POST http://localhost:8000/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your_token>" \
  -d '{"question":"What is machine learning?"}'
```

## File Structure

```
fai-project/
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── AuthContext.js (NEW)
│   │   ├── RoleSelection.js (NEW)
│   │   ├── SignUp.js (UPDATED)
│   │   ├── SignIn.js (UPDATED)
│   │   ├── ChatPage.js (UPDATED)
│   │   ├── UploadPage.js (UPDATED)
│   │   └── ...
├── backend/
│   ├── main.py (UPDATED)
│   ├── auth.py (UPDATED)
│   ├── database.py (NEW)
│   ├── jwt_utils.py (NEW)
│   ├── password_utils.py (NEW)
│   ├── .env (NEW)
│   └── ...
└── requirements.txt (UPDATED)
```
