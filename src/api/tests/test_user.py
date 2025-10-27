def test_create_user(client, test_seed_data, authenticate_demo_user):
	new_user = {
		"name": "Juan"
	}

	response = client.post("/users", json=new_user, headers=authenticate_demo_user)
	assert response.status_code == 200
	data = response.json()
	assert data["name"] == new_user["name"]


def test_get_users(client, test_seed_data):
	response = client.get("/users")
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	assert len(data) >= 5
	assert any(user["name"] == "Mariana" for user in data)


def test_search_users(client, test_seed_data):
	response = client.get("/users/search/", params={"query": "Marian", "threshold": 60})
	assert response.status_code == 200
	data = response.json()
	assert isinstance(data, list)
	assert any(user["name"] == "Mariana" for user in data)


def test_update_user(client, test_seed_data, authenticate_demo_user):
	updated_user = {
		"name": "Updated Mariana"
	}

	response = client.put(f"/users/1", json=updated_user, headers=authenticate_demo_user)
	assert response.status_code == 200
	data = response.json()
	assert data["name"] == updated_user["name"]


def test_delete_user(client, test_seed_data, authenticate_demo_user):
	response = client.delete(f"/users/1", headers=authenticate_demo_user)
	assert response.status_code == 200

	response = client.get(f"/users/1")
	assert response.status_code == 404
