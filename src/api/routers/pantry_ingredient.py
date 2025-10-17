from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.controllers import pantry_ingredient as controller
from src.api.dependencies.database import get_db
from src.api.schemas.pantry_ingredient import PantryIngredientCreate, PantryIngredientUpdate, PantryIngredientRead

router = APIRouter(prefix="/pantryingredient", tags=["Pantry Ingredient"])


@router.post("/", response_model=PantryIngredientRead)
def create(request: PantryIngredientCreate, db: Session = Depends(get_db)):
	return controller.create(db, request)


@router.get("/", response_model=list[PantryIngredientRead])
def read_all(db: Session = Depends(get_db)):
	return controller.read_all(db)


@router.get("/{pantry_ingredient_id}", response_model=PantryIngredientRead)
def read_one(pantry_ingredient_id: int, db: Session = Depends(get_db)):
	return controller.read_one(db, pantry_ingredient_id)


@router.put("/{pantry_ingredient_id}", response_model=PantryIngredientRead)
def update(pantry_ingredient_id: int, request: PantryIngredientUpdate, db: Session = Depends(get_db)):
	return controller.update(db, pantry_ingredient_id, request)


@router.delete("/{pantry_ingredient_id}")
def delete(pantry_ingredient_id: int, db: Session = Depends(get_db)):
	return controller.delete(db, pantry_ingredient_id)
