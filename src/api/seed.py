from src.api.dependencies.database import SessionLocal
from src.api.models import User, Role
from src.api.models.ingredient import Ingredient
from src.api.models.pantry_ingredient import PantryIngredient
from src.api.models.recipe import Recipe
from src.api.models.category import Category
from src.api.util.auth import hash_password


def seed_if_needed():
	db = SessionLocal()

	if db.query(Ingredient).count() == 0:
		ingredients = [
			Ingredient(id=1, name="Bacon"),
			Ingredient(id=2, name="Lamb"),
			Ingredient(id=3, name="Mayonnaise"),
			Ingredient(id=4, name="Ciabatta"),
			Ingredient(id=5, name="French Lentils"),
			Ingredient(id=6, name="Leek"),
			Ingredient(id=7, name="Butter"),
			Ingredient(id=8, name="Cheese"),
			Ingredient(id=9, name="Potatoes"),
			Ingredient(id=10, name="Lettuce"),
			Ingredient(id=11, name="Green Plantain"),
			Ingredient(id=12, name="Yellow Plantain"),
			Ingredient(id=13, name="Chicharron"),
		]

		db.add_all(ingredients)
		db.commit()

	if db.query(Category).count() == 0:
		categories = [
			Category(id=1, name="Breakfast", description="Morning meals, oats, eggs, smoothies"),
			Category(id=2, name="Lunch", description="Midday meals, salads, sandwiches, bowls"),
			Category(id=3, name="Dinner", description="Evening meals, pastas, stir-fries, roasts"),
			Category(id=4, name="Snacks", description="Light bites, bars, dips, small portions"),
			Category(id=5, name="Vegetarian", description="Vegetable-forward recipes"),
			Category(id=6, name="Gluten Free", description="Recipes without gluten"),
			Category(id=7, name="Dairy Free", description="Recipes without dairy products"),
		]

		db.add_all(categories)
		db.commit()

	if db.query(Recipe).count() == 0:
		kapsalon = Recipe(
			id=1,
			title="Kapsalon",
			description="Dutch dish made with fries, lamb, and salad, topped with garlic sauce.",
			instructions=(
				"1. Cut the meat into thin strips.\n"
				"2. Heat a drizzle of oil in a pan and fry the meat for about 6 minutes until cooked through.\n"
				"3. Bake or deep-fry the fries until golden brown and crisp.\n"
				"4. Spread the fries in a baking dish, add the fried meat in an even layer.\n"
				"5. Sprinkle grated cheese over the meat and place under a hot grill or in the oven until the cheese melts.\n"
				"6. Chop lettuce, tomato and cucumber; toss to make a simple salad.\n"
				"7. Spoon the salad over the baked dish, drizzle with garlic sauce and hot sauce, then serve immediately."
			),
			ingredient_id_list="2,8,9,10,3",
			category_id_list="3",
			servings=1,
			video_embed_url="https://www.youtube.com/embed/UIcuiU1kV8I",
			image_url="https://www.themealdb.com/images/media/meals/sxysrt1468240488.jpg"
		)

		flamiche = Recipe(
			id=2,
			title="Flamiche",
			description="French leek tart with a buttery crust.",
			instructions=(
				"1. Prepare shortcrust pastry and line a 23cm flan tin; chill.\n"
				"2. Blind bake the pastry base until lightly golden.\n"
				"3. Melt butter in a pan, add sliced leeks and salt; cover and soften for about 10 minutes.\n"
				"4. Beat crème fraîche with eggs and nutmeg; season, then fold in the cooked leeks.\n"
				"5. Pour the leek mixture into the pastry shell and bake at 190°C for about 35-40 minutes until set and golden.\n"
				"6. Let rest for 10 minutes, then remove from tin and serve warm."
			),
			ingredient_id_list="6,7,8",
			category_id_list="3,5",
			servings=4,
			video_embed_url="https://www.youtube.com/embed/x4AlJXOwfPk?si=o98UxmzsI_R3LhQH",
			image_url="https://www.themealdb.com/images/media/meals/wssvvs1511785879.jpg"
		)

		bacon_ciabatta = Recipe(
			id=3,
			title="Bacon Ciabatta Sandwich",
			description="Crispy bacon with mayonnaise on toasted ciabatta.",
			instructions=(
				"1. Preheat a pan and fry bacon slices until crispy; drain on paper towel.\n"
				"2. Slice the ciabatta roll and lightly toast until golden.\n"
				"3. Spread mayonnaise on both halves of the ciabatta.\n"
				"4. Layer the bacon on the bottom half, add lettuce if desired, then top with the ciabatta lid.\n"
				"5. Slice in half and serve while warm."
			),
			ingredient_id_list="1,3,4,10",
			category_id_list="2",
			servings=1,
			video_embed_url="",
			image_url="https://essenrezept.de/wp-content/uploads/2020/12/Caprese-Bacon-Ciabatta-Sandwich.jpg",
		)

		lentil_salad = Recipe(
			id=4,
			title="French Lentil Salad",
			description="Warm French lentils tossed with shallot vinaigrette.",
			instructions=(
				"1. Rinse lentils and place in a pot with water; bring to a boil then simmer until tender but not mushy (about 20-25 minutes).\n"
				"2. Drain lentils and allow to cool slightly.\n"
				"3. Whisk together olive oil, vinegar, minced shallot, salt, and pepper to make vinaigrette.\n"
				"4. Toss the warm lentils with vinaigrette, add chopped herbs if available, and serve warm or at room temperature."
			),
			ingredient_id_list="5,7",
			category_id_list="2,5,6",
			servings=2,
			video_embed_url="",
			image_url="https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
		)

		roast_lamb = Recipe(
			id=5,
			title="Simple Roast Lamb Chops",
			description="Pan-roasted lamb loin chops with a simple seasoning.",
			instructions=(
				"1. Pat lamb loin chops dry and season with salt and pepper.\n"
				"2. Heat a heavy skillet over medium-high heat with a splash of oil.\n"
				"3. Sear the lamb chops 2-3 minutes per side until browned.\n"
				"4. Finish in a preheated oven at 200°C for 5-8 minutes for medium, or longer for well done.\n"
				"5. Rest the chops for 5 minutes before serving."
			),
			ingredient_id_list="2",
			category_id_list="3,6",
			servings=2,
			video_embed_url="",
			image_url="https://www.themealdb.com/images/media/meals/1bsv1q1560459826.jpg",
		)

		cheesy_potatoes = Recipe(
			id=6,
			title="Cheesy Potato Bake",
			description="Layered potatoes baked with cheese and butter until golden.",
			instructions=(
				"1. Preheat oven to 190°C. Slice potatoes thinly.\n"
				"2. Butter a baking dish and arrange a layer of potato slices.\n"
				"3. Sprinkle grated cheese and a little salt, then repeat layers until dish is filled.\n"
				"4. Cover with foil and bake for 30-40 minutes, then remove foil and bake another 10 minutes until cheese is browned.\n"
				"5. Let rest for 5 minutes, then serve as a side dish."
			),
			ingredient_id_list="9,8,7",
			category_id_list="3,5,6",
			servings=4,
			video_embed_url="",
			image_url="https://therecipeshome.com/wp-content/uploads/2025/07/0_3-1752240157235.webp",
		)

		garden_salad = Recipe(
			id=7,
			title="Quick Garden Salad",
			description="Fresh lettuce salad with a light vinaigrette.",
			instructions=(
				"1. Chop lettuce and any additional salad veggies you have.\n"
				"2. Whisk together olive oil, vinegar, salt, and pepper to taste.\n"
				"3. Toss the veggies with the dressing right before serving to keep them crisp.\n"
				"4. Optionally top with croutons or a sprinkle of cheese."
			),
			ingredient_id_list="10",
			category_id_list="4,5,6,7",
			servings=2,
			video_embed_url="",
			image_url="https://www.themealdb.com/images/media/meals/wvpsxx1468256321.jpg",
		)

		bolon = Recipe(
            id = 8,
            title = "Bolon",
            description = "Famous Ecuadorian dish usually served at brunch and with a beef stew",
            instructions = "Cut the plantain into slices, fried the slices, mash them up a little bit, add chicharron and make a ball like shape",
            ingredient_id_list = "11,13",
            category_id_list = "1,7",
            servings = 1,
            video_embed_url = "https://www.youtube.com/embed/UaCEH8cRzpI",
            image_url = "https://img.goraymi.com/2017/12/15/c33a10f623d5e94cdef6f63776408547_xl.jpg",
        )

		db.add_all([
			kapsalon,
			flamiche,
			bacon_ciabatta,
			lentil_salad,
			roast_lamb,
			cheesy_potatoes,
			garden_salad,
            bolon
		])
		db.commit()

	if db.query(PantryIngredient).count() == 0:
		pantry1 = PantryIngredient(
			user_id=1,
			ingredient_id=1,
			quantity="Two",
			unit="kgs"
		)
		db.add(pantry1)
		db.commit()

	if db.query(User).filter(User.username == "test").first() is None:
		test_user = User(
			username="test",
			email="test@mail.com",
			hashed_password=hash_password("testpassword")
		)
		db.add(test_user)
		db.commit()

	if db.query(User).filter(User.username == "testadmin").first() is None:
		test_user = User(
			username="testadmin",
			email="testadmin@mail.com",
			hashed_password=hash_password("testadminpassword"),
			role=Role.Administrator
		)
		db.add(test_user)
		db.commit()

	db.close()

