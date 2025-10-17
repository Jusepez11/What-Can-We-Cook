from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.controllers import ingredient as controller
from src.api.dependencies.database import get_db
from src.api.schemas.ingredient import IngredientCreate, IngredientUpdate, IngredientRead

router = APIRouter(prefix="/ingredient", tags=["Ingredients"])


@router.post("/", response_model=IngredientRead)
def create(request: IngredientCreate, db: Session = Depends(get_db)):
	return controller.create(db, request)


@router.get("/", response_model=list[IngredientRead])
def read_all(db: Session = Depends(get_db)):
	return controller.read_all(db)


@router.get("/{ingredient_id}", response_model=IngredientRead)
def read_one(ingredient_id: int, db: Session = Depends(get_db)):
	return controller.read_one(db, ingredient_id)


@router.put("/{ingredient_id}", response_model=IngredientRead)
def update(ingredient_id: int, request: IngredientUpdate, db: Session = Depends(get_db)):
	return controller.update(db, ingredient_id, request)


@router.delete("/{ingredient_id}")
def delete(ingredient_id: int, db: Session = Depends(get_db)):
	return controller.delete(db, ingredient_id)
