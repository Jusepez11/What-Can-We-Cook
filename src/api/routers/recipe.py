from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.controllers import recipe as controller
from src.api.dependencies.database import get_db
from src.api.schemas.recipe import RecipeCreate, RecipeUpdate, RecipeRead

router = APIRouter(prefix="/recipes", tags=["Recipes"])


@router.post("/", response_model=RecipeRead)
def create(request: RecipeCreate, db: Session = Depends(get_db)):
	return controller.create(db, request)


@router.get("/", response_model=list[RecipeRead])
def read_all(db: Session = Depends(get_db)):
	return controller.read_all(db)


@router.get("/{recipe_id}", response_model=RecipeRead)
def read_one(recipe_id: int, db: Session = Depends(get_db)):
	return controller.read_one(db, recipe_id)


@router.put("/{recipe_id}", response_model=RecipeRead)
def update(recipe_id: int, request: RecipeUpdate, db: Session = Depends(get_db)):
	return controller.update(db, recipe_id, request)


@router.delete("/{recipe_id}")
def delete(recipe_id: int, db: Session = Depends(get_db)):
	return controller.delete(db, recipe_id)
