import os
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session
from .database import get_db, User, UserRole
from .jwt_utils import verify_access_token


def get_current_user(request: Request, db: Session = Depends(get_db)) -> dict:
    """Extract and verify the JWT token from request headers."""
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authorization header.",
        )

    token = auth_header.split(" ", 1)[1].strip()
    try:
        payload = verify_access_token(token)
        email = payload.get("email")
        role = payload.get("role")
        
        # Verify user exists in database
        try:
            user = db.query(User).filter(User.email == email).first()
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="User not found.",
                )
        except Exception as db_err:
            print(f"Database error: {db_err}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Database error",
            )
        
        return {"email": email, "role": role, "name": user.name}
    except HTTPException:
        raise
    except Exception as e:
        print(f"Auth error: {e}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )


def require_teacher(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency to require teacher role."""
    if current_user["role"] != "teacher":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires teacher permissions.",
        )
    return current_user


def require_student(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency to require student role."""
    if current_user["role"] != "student":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="This action requires student permissions.",
        )
    return current_user


# Allow both student and teacher to access
def require_authenticated(current_user: dict = Depends(get_current_user)) -> dict:
    """Dependency to require any authenticated user."""
    return current_user

