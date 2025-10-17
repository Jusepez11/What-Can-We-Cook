from typing import Optional

from pydantic import BaseModel


class PantryIngredientBase(BaseModel):
	user_id: int
	ingredient_id: int
	quantity: str
	unit: str


class PantryIngredientCreate(PantryIngredientBase):
	pass


class PantryIngredientUpdate(BaseModel):
	user_id: Optional[int] = None
	ingredient_id: Optional[int] = None
	quantity: Optional[str] = None
	unit: Optional[str] = None


class PantryIngredientRead(PantryIngredientBase):
	id: int

	model_config = {
		"from_attributes": True
	}
