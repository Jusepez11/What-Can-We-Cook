from typing import Optional

from pydantic import BaseModel

from src.api.models.user import Role


class User(BaseModel):
	"""Public representation of a user returned by the API."""
	username: str
	email: Optional[str] = None
	is_active: Optional[bool] = None
	role: Role = Role.User

	model_config = {
		"from_attributes": True
	}


class UserCreate(BaseModel):
	"""Payload used to create a new user account."""
	username: str
	email: str
	password: str

	model_config = {
		"from_attributes": True
	}


class UserUpdate(BaseModel):
	"""Public representation of a user returned by the API."""
	username: Optional[str] = None
	email: Optional[str] = None
	is_active: Optional[bool] = None
	role: Role = Role.User


class UserRead(BaseModel):
	"""Public representation of a user returned by the API."""
	id: int
