from typing import Optional, List

from fastapi import HTTPException, status, Response
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.api.models.user import User as Model
from src.api.schemas.user import UserCreate, UserUpdate
from src.api.util.auth import hash_password, verify_password


def create(db: Session, request: UserCreate):
	"""Create a new user record with a hashed password and return it."""
	hashed_password = hash_password(request.password)
	new_item = Model(
		username=request.username,
		email=request.email,
		hashed_password=hashed_password
	)

	try:
		db.add(new_item)
		db.commit()
		db.refresh(new_item)
	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

	return new_item


def read_all(db: Session, skip: int = 0, limit: int = 100) -> List[type[Model]]:
	"""Return a list of users with optional pagination (skip, limit)."""
	try:
		result = db.query(Model).offset(skip).limit(limit).all()
	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
	return result


def read_one(db: Session, id: int):
	"""Return a user by their integer ID, or raise 404 if not found."""
	try:
		item = db.query(Model).filter(Model.id == id).first()
		if not item:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Id not found!")
	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

	return item


def update(db: Session, id: int, request: UserUpdate):
	"""Update an existing user record and return it, or raise 404 if not found."""
	try:
		item = db.query(Model).filter(Model.id == id)
		if not item.first():
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Id not found!")
		update_data = request.model_dump(exclude_unset=True)
		item.update(update_data, synchronize_session=False)
		db.commit()
	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
	return item.first()


def delete(db: Session, id: int):
	"""Delete a user by ID, or raise 404 if not found."""
	try:
		item = db.query(Model).filter(Model.id == id)
		if not item.first():
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Id not found!")
		item.delete(synchronize_session=False)
		db.commit()
	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
	return Response(status_code=status.HTTP_204_NO_CONTENT)


# Helper functions for authentication and user lookup
def read_user_by_username(db: Session, username: str) -> Optional[Model]:
	"""Return a user by username, or None if not found."""
	return db.query(Model).filter(Model.username == username).first()


def read_user_by_email(db: Session, email: str) -> Optional[Model]:
	"""Return a user by email, or None if not found."""
	return db.query(Model).filter(Model.email == email).first()


def authenticate_user(db: Session, username: str, password: str) -> Optional[Model]:
	"""Verify username/email and password and return the user on success, otherwise None.

	The username parameter can be either a username or an email address.
	"""
	user = read_user_by_username(db, username)
	if not user:
		user = read_user_by_email(db, username)

	if not user:
		return None

	if not verify_password(password, user.hashed_password):
		return None

	return user
