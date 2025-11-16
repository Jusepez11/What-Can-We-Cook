from sqlalchemy import Integer, Column, String

from src.api.dependencies.database import Base


class Category(Base):
	"""SQLAlchemy Category model representing recipe categories."""
	__tablename__ = "categories"

	id = Column(Integer, primary_key=True, index=True)
	name = Column(String, unique=True, index=True, nullable=False)
	description = Column(String, nullable=True)

	def __repr__(self) -> str:
		"""Readable representation useful in logs/debugging"""
		return f"<Category id={self.id} name={self.name}>"
