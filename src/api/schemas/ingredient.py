from typing import Optional

from pydantic import BaseModel


class IngredientBase(BaseModel):
	name: str


class IngredientCreate(IngredientBase):
	pass


class IngredientUpdate(BaseModel):
	name: Optional[str] = None


class IngredientRead(IngredientBase):
	id: int

	model_config = {
		"from_attributes": True
	}
