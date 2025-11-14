from typing import List

from fastapi import HTTPException, status, Response
from fuzzywuzzy import fuzz
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.api.models.ingredient import Ingredient
from src.api.models.recipe import Recipe as Model


def create(db: Session, request):
	new_item = Model(
		title=request.title,
		description=request.description,
		instructions=request.instructions,
		ingredient_id_list=request.ingredient_id_list,
		servings=request.servings,
		video_embed_url=request.video_embed_url,
		image_url=request.image_url,
	)

	try:
		db.add(new_item)
		db.commit()
		db.refresh(new_item)
	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
	return new_item


def read_recent(db: Session, limit: int = 10) -> List[type[Model]]:
	"""
	Get the most recent recipes ordered by creation date.
	"""
	try:
		result = db.query(Model).order_by(Model.created_at.desc()).limit(limit).all()
	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
	return result


def read_all(db: Session, skip: int = 0, limit: int = 100) -> List[type[Model]]:
	try:
		result = db.query(Model).offset(skip).limit(limit).all()
	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
	return result


def read_one(db: Session, id):
	try:
		item = db.query(Model).filter(Model.id == id).first()
		if not item:
			raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Id not found!")
	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)

	return item


def update(db: Session, id, request):
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


def delete(db: Session, id):
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


def search(db: Session, query: str, threshold: int = 60) -> List[type[Model]]:
	"""
	Search recipes by title, description, or ingredients using fuzzy matching.
	Returns recipes sorted by relevance score.
	"""
	try:
		# Get all recipes
		all_recipes = db.query(Model).all()

		# Get all ingredients for ingredient-based search
		all_ingredients = db.query(Ingredient).all()
		ingredient_map = {str(ing.id): ing.name for ing in all_ingredients}

		results = []

		for recipe in all_recipes:
			# Calculate fuzzy match scores for different fields
			title_score = fuzz.partial_ratio(query.lower(), recipe.title.lower())
			description_score = fuzz.partial_ratio(query.lower(),
			                                       recipe.description.lower() if recipe.description else "")

			# Check ingredient matches
			ingredient_ids = recipe.ingredient_id_list.split(',') if recipe.ingredient_id_list else []
			ingredient_score = 0
			for ing_id in ingredient_ids:
				ing_id = ing_id.strip()
				if ing_id in ingredient_map:
					ing_name = ingredient_map[ing_id]
					score = fuzz.partial_ratio(query.lower(), ing_name.lower())
					ingredient_score = max(ingredient_score, score)

			# Take the maximum score from all fields
			max_score = max(title_score, description_score, ingredient_score)

			# Only include if above threshold
			if max_score >= threshold:
				results.append({
					'recipe': recipe,
					'score': max_score
				})

		# Sort by score (highest first)
		results.sort(key=lambda x: x['score'], reverse=True)

		# Return just the recipes
		return [r['recipe'] for r in results]

	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
