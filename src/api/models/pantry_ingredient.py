from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, func
from sqlalchemy.orm import relationship

from src.api.dependencies.database import Base


class PantryIngredient(Base):
	"""SQLAlchemy Pantry model representing an ingredient in a user's pantry."""

	__tablename__ = "pantry_ingredients"

	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
	ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
	quantity = Column(String, nullable=False)
	unit = Column(String, nullable=False)
	created_at = Column(DateTime, default=func.now())
	updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

	user = relationship("src.api.models.user.User", back_populates="pantry_ingredients")
	ingredient = relationship("src.api.models.ingredient.Ingredient", back_populates="pantry_ingredients")

	def __repr__(self) -> str:
		"""Readable representation useful in logs/debugging"""
		return f"<Pantry id={self.id} user_id={self.user_id} ingredient_id={self.ingredient_id} quantity={self.quantity} unit={self.unit}>"
