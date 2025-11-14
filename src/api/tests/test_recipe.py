def test_get_recipe(client, test_seed_data):
	response = client.get("/recipes/1")
	assert response.status_code == 200
	data = response.json()
	assert data["id"] == 1
	assert data["title"] == "Kapsalon"


def test_get_all_recipes(client, test_seed_data):
	"""Test retrieving all recipes"""
	response = client.get("/recipes/")
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	assert len(data) >= 7


def test_get_recent_recipes(client, test_seed_data):
	"""Test retrieving recent recipes"""
	response = client.get("/recipes/recent/", params={"limit": 3})
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	assert len(data) <= 3

	# Test default limit
	response = client.get("/recipes/recent/")
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	assert len(data) >= 7


def test_search_recipes(client, test_seed_data):
	"""Test searching recipes by text"""
	response = client.get("/recipes/search/", params={"query": "Lamb", "threshold": 70})
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	assert len(data) > 0
	assert any("Lamb" in recipe["title"] or "lamb" in recipe["title"].lower() for recipe in data)


def test_get_recipes_by_category(client, test_seed_data):
	"""Test retrieving recipes filtered by category"""
	response = client.get("/recipes/category/3")
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	assert len(data) > 0

	for recipe in data:
		assert recipe["category_id_list"] is not None
		category_ids = [cid.strip() for cid in recipe["category_id_list"].split(',')]
		assert "3" in category_ids


def test_get_recipes_by_vegetarian_category(client, test_seed_data):
	"""Test retrieving vegetarian recipes (category ID 5)"""
	response = client.get("/recipes/category/5")
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	assert len(data) > 0

	recipe_titles = [recipe["title"] for recipe in data]
	assert "Flamiche" in recipe_titles or "French Lentil Salad" in recipe_titles


def test_get_recipes_by_nonexistent_category(client, test_seed_data):
	"""Test retrieving recipes for a category that doesn't exist"""
	response = client.get("/recipes/category/9999")
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	assert len(data) == 0


def test_create_recipe_with_categories(client, test_seed_data, authenticate_demo_user):
	"""Test creating a recipe with categories"""
	new_recipe = {
		"title": "Test Recipe with Categories",
		"description": "A test recipe",
		"instructions": "1. Test step one\n2. Test step two",
		"ingredient_id_list": "1,2",
		"category_id_list": "1,5",
		"servings": 2,
		"image_url": "https://example.com/image.jpg"
	}

	response = client.post("/recipes/", json=new_recipe, headers=authenticate_demo_user)
	assert response.status_code == 200
	data = response.json()
	assert data["title"] == new_recipe["title"]
	assert data["category_id_list"] == new_recipe["category_id_list"]

	breakfast_response = client.get("/recipes/category/1")
	breakfast_recipes = breakfast_response.json()
	assert any(recipe["id"] == data["id"] for recipe in breakfast_recipes)

	vegetarian_response = client.get("/recipes/category/5")
	vegetarian_recipes = vegetarian_response.json()
	assert any(recipe["id"] == data["id"] for recipe in vegetarian_recipes)


def test_update_recipe(client, test_seed_data, authenticate_demo_user):
	updated_recipe = {
		"title": "Updated Test Recipe"
	}

	response = client.put("/recipes/1", json=updated_recipe, headers=authenticate_demo_user)
	assert response.status_code == 200
	data = response.json()
	assert data["title"] == updated_recipe["title"]


def test_delete_recipe(client, test_seed_data, authenticate_demo_user, authenticate_demo_admin_user):
	response = client.delete("/recipes/1", headers=authenticate_demo_user)
	assert response.status_code == 403  # Non-admin recipe should not be able to delete

	response = client.delete("/recipes/1", headers=authenticate_demo_admin_user)
	assert response.status_code == 204  # Admin recipe should be able to delete

	response = client.get("/recipes/1")
	assert response.status_code == 404
