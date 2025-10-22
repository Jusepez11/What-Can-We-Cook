from src.api.dependencies.database import SessionLocal
from src.api.models.ingredient import Ingredient
from src.api.models.recipe import Recipe


def seed_if_needed():
	db = SessionLocal()

	if db.query(Ingredient).count() == 0:
		bacon = Ingredient(name="Bacon")
		lamb = Ingredient(name="Lamb")
		mayo = Ingredient(name="Mayonnaise")
		ciabatta = Ingredient(name="Ciabatta")
		lentils = Ingredient(name="French Lentils")
		db.add_all([bacon, lamb, mayo, ciabatta, lentils])
		db.commit()

	if db.query(Recipe).count() == 0:
		kapsalon = Recipe(
			title="Kapsalon",
			description="Dutch dish made with fries, lamb, and salad, topped with garlic sauce.",
			instructions="Cut the meat into strips. Fry until ready. Bake fries until golden brown...",
			ingredient_id_list="1,2,3,4",
			servings=1,
			video_embed_url="https://www.youtube.com/watch?v=UIcuiU1kV8I",
		)

		flamiche = Recipe(
			title="Flamiche",
			description="French leek tart with a buttery crust.",
			instructions="Prepare pastry, cook leeks until soft, fill tart case, and bake until golden.",
			ingredient_id_list="3,5",
			servings=1,
			video_embed_url="https://www.youtube.com/watch?v=vT0q5c880Rg",
		)

		db.add_all([kapsalon, flamiche])
		db.commit()

	db.close()
