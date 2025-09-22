from sqlalchemy import Column, Integer, ForeignKey, String, DateTime, func
from sqlalchemy.orm import relationship

from src.api.dependencies.database import Base


class PantryIngredient(Base):
	"""SQLAlchemy Pantry model representing an ingredient in a user's pantry."""

	__tablename__ = "pantries"

	id = Column(Integer, primary_key=True, index=True)
	user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
	ingredient_id = Column(Integer, ForeignKey("ingredients.id"), nullable=False)
	quantity = Column(String, nullable=False)
	unit = Column(String, nullable=False)
	created_at = Column(DateTime, default=func.now())
	updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

	user = relationship("User", back_populates="pantries")
	ingredient = relationship("Ingredient", back_populates="pantries")

	def __repr__(self) -> str:
		"""Readable representation useful in logs/debugging"""
		return f"<Pantry id={self.id} user_id={self.user_id} ingredient_id={self.ingredient_id} quantity={self.quantity} unit={self.unit}>"
