from typing import Optional

from pydantic import BaseModel


class RecipeBase(BaseModel):
	title: str
	description: str
	instructions: str
	ingredient_id_list: str
	servings: int
	video_embed_url: Optional[str] = None


class RecipeCreate(RecipeBase):
	pass


class RecipeUpdate(BaseModel):
	title: Optional[str] = None
	description: Optional[str] = None
	instructions: Optional[str] = None
	ingredient_id_list: Optional[str] = None
	servings: Optional[int] = None
	video_embed_url: Optional[str] = None


class RecipeRead(RecipeBase):
	id: int

	model_config = {
		"from_attributes": True
	}
