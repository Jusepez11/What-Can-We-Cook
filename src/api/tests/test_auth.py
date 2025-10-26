def test_register_user(client, test_seed_data):
	new_user = {
		"username": "test1",
		"email": "test1@mail.com",
		"password": "testpassword"
	}

	response = client.post("/auth/register", json=new_user)
	assert response.status_code == 200
	data = response.json()
	assert data["username"] == new_user["username"]
	assert data["email"] == new_user["email"]
	assert "is_active" in data
	assert "role" in data


def test_register_existing_details(client, test_seed_data):
	existing_user = {
		"username": "test",
		"email": "test@mail.com",
		"password": "testpassword"
	}

	response = client.post("/auth/register", json=existing_user)
	assert response.status_code == 400
	data = response.json()
	assert data["detail"] == "Username already registered"

	existing_user["username"] = "newusername"
	response = client.post("/auth/register", json=existing_user)
	assert response.status_code == 400
	data = response.json()
	assert data["detail"] == "Email already registered"


def test_login_user(client, test_seed_data):
	login_data = {
		"username": "test",
		"password": "testpassword"
	}

	response = client.post("/auth/login", data=login_data)
	assert response.status_code == 200
	data = response.json()
	assert "access_token" in data
	assert data["token_type"] == "bearer"

	login_data["username"] = "newusername"
	response = client.post("/auth/login", data=login_data)
	assert response.status_code == 401


def test_protected_route(client, test_seed_data, authenticate_demo_user):
	response = client.get("/auth/demo", headers=authenticate_demo_user)
	assert response.status_code == 200
	data = response.json()
	assert "Hello" in data["message"]
