from typing import List

from fastapi import HTTPException, status, Response
from fuzzywuzzy import fuzz
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from src.api.models.ingredient import Ingredient as Model


def create(db: Session, request):
	new_item = Model(
		name=request.name,
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
	try:
		result = db.query(Model).offset(skip).limit(limit).all()
	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)
	return result


def search(db: Session, query: str, threshold: int = 60) -> List[type[Model]]:
	"""Search for ingredients by name with fuzzy matching."""
	try:
		# Get all ingredients
		all_ingredients = db.query(Model).all()

		results = []
		for ingredient in all_ingredients:
			# Calculate fuzzy match score
			score = fuzz.partial_ratio(query.lower(), ingredient.name.lower())

			# Only include if above threshold
			if score >= threshold:
				results.append({
					'ingredient': ingredient,
					'score': score
				})

		# Sort by score (highest first)
		results.sort(key=lambda x: x['score'], reverse=True)

		# Return just the ingredients, limited to 50
		return [r['ingredient'] for r in results][:50]

	except SQLAlchemyError as e:
		error = str(e.__dict__['orig'])
		raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=error)


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
		update_data = request.dict(exclude_unset=True)
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
