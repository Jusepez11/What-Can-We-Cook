import os
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict

from argon2 import PasswordHasher
from argon2.exceptions import VerifyMismatchError
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from src.api.controllers import user as user_controller
from src.api.dependencies.database import get_db
from src.api.models.user import User as UserModel, Role
from src.api.schemas.user import User as UserSchema

# Use a sensible default for development; production should set AUTH_SECRET_KEY.
SECRET_KEY = os.getenv("AUTH_SECRET_KEY", "dev-secret")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

# Argon2 password hasher with secure defaults
ph = PasswordHasher()


def hash_password(password: str) -> str:
	"""Hash a password using Argon2."""
	return ph.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
	"""Verify a password against an Argon2 hash.

	Returns True if the password matches, False otherwise.
	"""
	try:
		ph.verify(hashed_password, plain_password)
		return True
	except VerifyMismatchError:
		return False


def convert_db_user_to_user(db_user: UserModel) -> UserSchema:
	"""Convert a SQLAlchemy User model to the Pydantic User schema.

	Only includes public-safe fields (no hashed password).
	"""
	return UserSchema(
		username=db_user.username,
		email=db_user.email,
		is_active=db_user.is_active,
		role=db_user.role
	)


def create_access_token(data: Dict[str, str], expires_delta: Optional[timedelta] = None) -> str:
	"""Create a JWT access token with an expiration.

	- data: payload to include (e.g., {"sub": username}).
	- expires_delta: optional expiry offset
	"""
	to_encode = data.copy()
	now = datetime.now(timezone.utc)
	if expires_delta:
		expire = now + expires_delta
	else:
		expire = now + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)

	# include standard claims
	to_encode.update({"exp": expire, "iat": now})
	encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
	return encoded_jwt


async def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> UserSchema:
	"""Decode JWT token and return the corresponding active user schema.

	Raises HTTP 401 if the token is invalid or the user does not exist.
	"""

	credentials_exception = HTTPException(
		status_code=status.HTTP_401_UNAUTHORIZED,
		detail="Could not validate credentials",
		headers={"WWW-Authenticate": "Bearer"},
	)

	try:
		payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
		username: Optional[str] = payload.get("sub")
		if not username:
			raise credentials_exception
	except JWTError:
		raise credentials_exception

	db_user = user_controller.read_user_by_username(db, username=username)
	if db_user is None:
		raise credentials_exception
	return convert_db_user_to_user(db_user)


async def get_current_active_user(current_user: UserSchema = Depends(get_current_user)) -> UserSchema:
	"""Ensure the current user is active; otherwise raise HTTP 400."""
	if not current_user.is_active:
		raise HTTPException(status_code=400, detail="Inactive user")
	return current_user


async def get_current_active_admin_user(current_user: UserSchema = Depends(get_current_user)) -> UserSchema:
	"""Ensure the current user is an active admin; otherwise raise HTTP 400."""
	if not current_user.is_active:
		raise HTTPException(status_code=400, detail="Inactive user")
	if current_user.role != Role.Administrator:
		raise HTTPException(status_code=403, detail="Insufficient privileges")
	return current_user
