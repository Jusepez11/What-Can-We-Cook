def test_get_user(client, test_seed_data):
	response = client.get("/users/1")
	assert response.status_code == 200
	data = response.json()
	assert data["id"] == 1
	assert data["username"] == "test"


def test_update_user(client, test_seed_data, authenticate_demo_user):
	updated_user = {
		"email": "updated@mail.com"
	}

	response = client.put("/users/1", json=updated_user, headers=authenticate_demo_user)
	assert response.status_code == 200
	data = response.json()
	assert data["email"] == updated_user["email"]


def test_delete_user(client, test_seed_data, authenticate_demo_user, authenticate_demo_admin_user):
	response = client.delete("/users/1", headers=authenticate_demo_user)
	assert response.status_code == 403  # Non-admin user should not be able to delete

	response = client.delete("/users/1", headers=authenticate_demo_admin_user)
	assert response.status_code == 204  # Admin user should be able to delete

	response = client.get("/users/1")
	assert response.status_code == 404
