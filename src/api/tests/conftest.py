import os

import pytest
from fastapi.testclient import TestClient

from src.api.models.category import Category

os.environ.setdefault("DATABASE_URL", "sqlite:///:memory:")

from src.api.dependencies.database import SessionLocal, engine, Base
from src.api.main import app
from src.api.models import Ingredient, Recipe
from src.api.seed import seed_if_needed

access_token = None
admin_access_token = None


@pytest.fixture(scope="module")
def client():
	return TestClient(app)


@pytest.fixture(scope="module")
def test_seed_data():
	Base.metadata.create_all(bind=engine)
	seed_if_needed()
	yield
	Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="module")
def authenticate_demo_user(client):
	global access_token
	if access_token is None:
		login_data = {
			"username": "test",
			"password": "testpassword"
		}

		response = client.post("/auth/login", data=login_data)
		assert response.status_code == 200
		data = response.json()
		access_token = data["access_token"]

	return {"Authorization": f"Bearer {access_token}"}


@pytest.fixture(scope="module")
def authenticate_demo_admin_user(client):
	global admin_access_token
	if admin_access_token is None:
		login_data = {
			"username": "testadmin",
			"password": "testadminpassword"
		}

		response = client.post("/auth/login", data=login_data)
		assert response.status_code == 200
		data = response.json()
		admin_access_token = data["access_token"]

	return {"Authorization": f"Bearer {admin_access_token}"}


def test_ensure_db_nonempty(test_seed_data):
	db = SessionLocal()
	ingredient_count = db.query(Ingredient).count()
	recipe_count = db.query(Recipe).count()
	category_count = db.query(Category).count()
	db.close()
	assert ingredient_count > 0
	assert recipe_count > 0
	assert category_count > 0
