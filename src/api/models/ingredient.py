from sqlalchemy import Column, Integer, String, func, DateTime
from sqlalchemy.orm import relationship

from src.api.dependencies.database import Base


class Ingredient(Base):
	"""SQLAlchemy Ingredient model representing ingredients."""
	__tablename__ = "ingredients"

	id = Column(Integer, primary_key=True, index=True, autoincrement=True)
	name = Column(String, unique=True, index=True, nullable=False)
	created_at = Column(DateTime, default=func.now())

	pantry_ingredients = relationship("src.api.models.pantry_ingredient.PantryIngredient", back_populates="ingredient")

	def __repr__(self) -> str:
		"""Readable representation useful in logs/debugging"""
		return f"<Ingredient id={self.id} name={self.name}>"
