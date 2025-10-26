from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from starlette import status

from src.api.controllers import user as user_controller
from src.api.dependencies.database import get_db
from src.api.schemas.user import User, UserCreate, UserRead
from src.api.util.auth import create_access_token, ACCESS_TOKEN_EXPIRE_MINUTES, get_current_active_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=dict)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
	"""Authenticate user credentials and return a JWT access token.

	Expects form-data with 'username' (can be username or email) and 'password'.
	Returns {"access_token": ..., "token_type": "bearer"}.
	"""
	user = user_controller.authenticate_user(db, form_data.username, form_data.password)
	if not user:
		raise HTTPException(
			status_code=status.HTTP_401_UNAUTHORIZED,
			detail="Incorrect username or password",
			headers={"WWW-Authenticate": "Bearer"},
		)

	access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
	access_token = create_access_token(
		data={"sub": user.username}, expires_delta=access_token_expires
	)
	return {"access_token": access_token, "token_type": "bearer"}


@router.post("/register", response_model=User)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
	"""Register a new user if the username and email are not already taken.

	Returns the newly created user's public data.
	"""
	# Check if user already exists
	db_user = user_controller.read_user_by_username(db, username=user.username)
	if db_user:
		raise HTTPException(status_code=400, detail="Username already registered")

	db_user = user_controller.read_user_by_email(db, email=user.email)
	if db_user:
		raise HTTPException(status_code=400, detail="Email already registered")

	new_user = user_controller.create(db=db, user=user)
	return User(
		username=new_user.username,
		email=new_user.email,
		is_active=new_user.is_active,
		role=new_user.role
	)


@router.get("/demo")
async def demo_protected_route(current_user: User = Depends(get_current_active_user)):
	"""A small protected demo route to verify authentication."""
	return {"message": f"Hello {current_user.username}, this is a protected route!"}


@router.get("/me", response_model=UserRead)
async def get_current_user_info(current_user: User = Depends(get_current_active_user), db: Session = Depends(get_db)):
	"""Get current authenticated user's info including user ID."""
	db_user = user_controller.read_user_by_username(db, username=current_user.username)
	if not db_user:
		raise HTTPException(status_code=404, detail="User not found")

	return UserRead.model_validate(db_user)
