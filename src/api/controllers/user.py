from typing import Optional, List

from passlib.context import CryptContext
from sqlalchemy.orm import Session

from src.api.models.user import User
from src.api.schemas.user import UserCreate, UserUpdate

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def read_user_by_id(db: Session, user_id: int) -> Optional[User]:
	"""Return a user by their integer ID, or None if not found."""
	return db.query(User).filter(User.id == user_id).first()


def read_user_by_username(db: Session, username: str) -> Optional[User]:
	"""Return a user by username, or None if not found."""
	return db.query(User).filter(User.username == username).first()


def read_user_by_email(db: Session, email: str) -> Optional[User]:
	"""Return a user by email, or None if not found."""
	return db.query(User).filter(User.email == email).first()


def create(db: Session, user: UserCreate) -> User:
	"""Create a new user record with a hashed password and return it."""
	hashed_password = pwd_context.hash(user.password)
	db_user = User(
		username=user.username,
		email=user.email,
		hashed_password=hashed_password
	)

	db.add(db_user)
	db.commit()
	db.refresh(db_user)
	return db_user


def update(db: Session, user_id: int, updated_user: UserUpdate) -> Optional[User]:
	"""Update an existing user record and return it, or None if not found."""
	user = read_user_by_id(db, user_id)
	if not user:
		return None

	if updated_user.username is not None:
		user.username = updated_user.username
	if updated_user.email is not None:
		user.email = updated_user.email
	if updated_user.is_active is not None:
		user.is_active = updated_user.is_active
	if updated_user.role is not None:
		user.role = updated_user.role

	db.commit()
	db.refresh(user)
	return user


def delete(db: Session, user_id: int) -> bool:
	"""Delete a user by ID. Returns True on success, False if user not found."""
	user = read_user_by_id(db, user_id)
	if not user:
		return False

	db.delete(user)
	db.commit()
	return True


def authenticate_user(db: Session, username: str, password: str) -> Optional[User]:
	"""Verify username/password and return the user on success, otherwise False/None."""
	user = read_user_by_username(db, username)
	if not user:
		return None
	if not pwd_context.verify(password, user.hashed_password):
		return None
	return user


def get_all_users(db: Session, skip: int = 0, limit: int = 100) -> List[type[User]]:
	"""Return a list of users with optional pagination (skip, limit)."""
	return db.query(User).offset(skip).limit(limit).all()
