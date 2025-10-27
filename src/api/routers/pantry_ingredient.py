from typing import Optional

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.controllers import pantry_ingredient as controller
from src.api.dependencies.database import get_db
from src.api.schemas.pantry_ingredient import PantryIngredientCreate, PantryIngredientUpdate, PantryIngredientRead
from src.api.schemas.user import User as UserSchema
from src.api.util.auth import get_current_active_user, get_current_active_admin_user

router = APIRouter(
	prefix="/pantryingredient",
	tags=["Pantry Ingredient"],
	dependencies=[Depends(get_current_active_user)]
)


@router.post("/", response_model=PantryIngredientRead)
def create(request: PantryIngredientCreate, db: Session = Depends(get_db)):
	return controller.create(db, request)


@router.get("/", response_model=list[PantryIngredientRead])
def read_all(user_id: Optional[int] = None, db: Session = Depends(get_db)):
	return controller.read_all(db, user_id=user_id)


@router.get("/pantry", response_model=list[PantryIngredientRead])
def read_my_pantry(current_user: UserSchema = Depends(get_current_active_user), db: Session = Depends(get_db)):
	pantry_items = controller.read_by_user(db, current_user.username)

	result = []
	for item in pantry_items:
		result.append(PantryIngredientRead(
			id=item.id,
			user_id=item.user_id,
			ingredient_id=item.ingredient_id,
			quantity=item.quantity,
			unit=item.unit,
			ingredient_name=item.ingredient.name if item.ingredient else None
		))

	return result


@router.get("/{pantry_ingredient_id}", response_model=PantryIngredientRead)
def read_one(pantry_ingredient_id: int, db: Session = Depends(get_db)):
	return controller.read_one(db, pantry_ingredient_id)


@router.put("/{pantry_ingredient_id}", response_model=PantryIngredientRead, dependencies=[Depends(get_current_active_user)])
def update(pantry_ingredient_id: int, request: PantryIngredientUpdate, db: Session = Depends(get_db)):
	return controller.update(db, pantry_ingredient_id, request)


@router.delete("/{pantry_ingredient_id}", dependencies=[Depends(get_current_active_admin_user)])
def delete(pantry_ingredient_id: int, db: Session = Depends(get_db)):
	return controller.delete(db, pantry_ingredient_id)
