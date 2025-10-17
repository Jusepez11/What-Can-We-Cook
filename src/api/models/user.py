import enum

from sqlalchemy import Column, Integer, String, Boolean, DateTime, func, Enum
from sqlalchemy.orm import relationship

from src.api.dependencies.database import Base


class Role(enum.Enum):
	"""Enumeration of possible user roles."""
	User = "user"
	Administrator = "admin"
	Moderator = "moderator"


class User(Base):
	"""SQLAlchemy User model representing user accounts."""
	__tablename__ = "users"

	id = Column(Integer, primary_key=True, index=True, autoincrement=True)
	username = Column(String, unique=True, index=True)
	email = Column(String, unique=True, index=True)
	hashed_password = Column(String, nullable=False)
	is_active = Column(Boolean, default=True, nullable=False)
	created_at = Column(DateTime, default=func.now())
	role = Column(Enum(Role), default=Role.User, nullable=False)

	pantries = relationship("PantryIngredient", back_populates="user")

	def __repr__(self) -> str:
		"""Readable representation useful in logs/debugging"""
		return f"<User id={self.id} username={self.username} email={self.email} role={self.role}>"
