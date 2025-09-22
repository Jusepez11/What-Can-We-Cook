from sqlalchemy import Integer, Column, String, DateTime, func

from src.api.dependencies.database import Base


class Recipe(Base):
	"""SQLAlchemy Recipe model representing recipes."""
	__tablename__ = "recipes"

	id = Column(Integer, primary_key=True, index=True)
	title = Column(String, unique=True, index=True, nullable=False)
	description = Column(String, nullable=True)
	instructions = Column(String, nullable=False)
	ingredient_id_list = Column(String, nullable=False)  # Comma-separated list of ingredient IDs
	servings = Column(Integer, nullable=False)
	video_embed_url = Column(String, nullable=True)
	created_at = Column(DateTime, default=func.now())
	updated_at = Column(DateTime, default=func.now(), onupdate=func.now())

	def __repr__(self) -> str:
		"""Readable representation useful in logs/debugging"""
		return f"<Recipe id={self.id} title={self.title}>"
