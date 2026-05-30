from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from app.database import get_db, User
from app.auth.security import verify_password, create_access_token, get_password_hash
from app.auth.dependencies import get_current_user
from app.models import UserLogin, Token, UserResponse

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login", response_model=Token)
def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == login_data.email).first()
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name or user.email.split("@")[0].title()
    }

# Also support OAuth2 form login for Swagger UI docs
@router.post("/oauth-login", response_model=Token)
def oauth_login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = create_access_token(subject=user.email)
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "role": user.role,
        "full_name": user.full_name or user.email.split("@")[0].title()
    }

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

def seed_users(db: Session):
    """Seed default users for testing (Admin, Manager, Employee)"""
    default_users = [
        ("admin@bizintel.ai", "adminpassword", "Admin", "Enterprise Admin"),
        ("manager@bizintel.ai", "managerpassword", "Manager", "Operations Manager"),
        ("employee@bizintel.ai", "employeepassword", "Employee", "Staff Analyst")
    ]
    for email, password, role, name in default_users:
        exists = db.query(User).filter(User.email == email).first()
        if not exists:
            new_user = User(
                email=email,
                hashed_password=get_password_hash(password),
                role=role,
                full_name=name
            )
            db.add(new_user)
    db.commit()
