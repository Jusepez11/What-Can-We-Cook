def test_get_all_categories(client, test_seed_data):
	"""Test retrieving all categories"""
	response = client.get("/categories/")
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	assert len(data) >= 7

	category_names = [cat["name"] for cat in data]
	assert "Breakfast" in category_names
	assert "Lunch" in category_names
	assert "Dinner" in category_names
	assert "Snacks" in category_names
	assert "Vegetarian" in category_names
	assert "Gluten Free" in category_names
	assert "Dairy Free" in category_names


def test_get_category_by_id(client, test_seed_data):
	"""Test retrieving a specific category by ID"""
	response = client.get("/categories/1")
	assert response.status_code == 200
	data = response.json()
	assert data["id"] == 1
	assert data["name"] == "Breakfast"
	assert "description" in data


def test_get_nonexistent_category(client, test_seed_data):
	"""Test retrieving a category that doesn't exist"""
	response = client.get("/categories/9999")
	assert response.status_code == 404


def test_create_category_as_admin(client, test_seed_data, authenticate_demo_admin_user):
	"""Test creating a new category as an admin user"""
	new_category = {
		"name": "Dessert",
		"description": "Sweet treats and desserts"
	}

	response = client.post("/categories/", json=new_category, headers=authenticate_demo_admin_user)
	assert response.status_code == 200
	data = response.json()
	assert data["name"] == new_category["name"]
	assert data["description"] == new_category["description"]
	assert "id" in data


def test_create_category_as_regular_user(client, test_seed_data, authenticate_demo_user):
	"""Test that regular users cannot create categories"""
	new_category = {
		"name": "Test Category",
		"description": "This should fail"
	}

	response = client.post("/categories/", json=new_category, headers=authenticate_demo_user)
	assert response.status_code == 403  # Forbidden


def test_create_category_unauthenticated(client, test_seed_data):
	"""Test that unauthenticated users cannot create categories"""
	new_category = {
		"name": "Test Category",
		"description": "This should fail"
	}

	response = client.post("/categories/", json=new_category)
	assert response.status_code == 401  # Unauthorized


def test_update_category_as_admin(client, test_seed_data, authenticate_demo_admin_user):
	"""Test updating a category as an admin user"""
	updated_category = {
		"name": "Breakfast & Brunch",
		"description": "Morning meals, updated description"
	}

	response = client.put("/categories/1", json=updated_category, headers=authenticate_demo_admin_user)
	assert response.status_code == 200
	data = response.json()
	assert data["name"] == updated_category["name"]
	assert data["description"] == updated_category["description"]


def test_update_category_as_regular_user(client, test_seed_data, authenticate_demo_user):
	"""Test that regular users cannot update categories"""
	updated_category = {
		"name": "Updated Name"
	}

	response = client.put("/categories/1", json=updated_category, headers=authenticate_demo_user)
	assert response.status_code == 403  # Forbidden


def test_delete_category_as_admin(client, test_seed_data, authenticate_demo_admin_user):
	"""Test deleting a category as an admin user"""
	new_category = {
		"name": "Temporary Category",
		"description": "To be deleted"
	}
	create_response = client.post("/categories/", json=new_category, headers=authenticate_demo_admin_user)
	assert create_response.status_code == 200
	category_id = create_response.json()["id"]

	response = client.delete(f"/categories/{category_id}", headers=authenticate_demo_admin_user)
	assert response.status_code == 204

	get_response = client.get(f"/categories/{category_id}")
	assert get_response.status_code == 404


def test_delete_category_as_regular_user(client, test_seed_data, authenticate_demo_user):
	"""Test that regular users cannot delete categories"""
	response = client.delete("/categories/1", headers=authenticate_demo_user)
	assert response.status_code == 403  # Forbidden


def test_create_duplicate_category(client, test_seed_data, authenticate_demo_admin_user):
	"""Test that duplicate category names are prevented"""
	first_category = {
		"name": "Unique Test Category",
		"description": "First instance"
	}

	response = client.post("/categories/", json=first_category, headers=authenticate_demo_admin_user)
	assert response.status_code == 200

	duplicate_category = {
		"name": "Unique Test Category",
		"description": "Duplicate test"
	}

	response = client.post("/categories/", json=duplicate_category, headers=authenticate_demo_admin_user)
	assert response.status_code == 400  # Bad request
