import pytest
from sqlalchemy import MetaData

from src.api.dependencies.database import SessionLocal, engine
from src.api.models import User, Ingredient, Recipe, PantryIngredient
from src.api.seed import seed_if_needed


@pytest.fixture(scope="function", autouse=True)
def clean_db():
	meta = MetaData()
	meta.reflect(bind=engine)
	with engine.connect() as conn:
		for table in reversed(meta.sorted_tables):
			conn.execute(table.delete())
	yield


@pytest.fixture(scope="function")
def test_seed_data():
	seed_if_needed()


def test_ensure_db_nonempty(test_seed_data):
	db = SessionLocal()
	ingredient_count = db.query(Ingredient).count()
	recipe_count = db.query(Recipe).count()
	db.close()
	assert ingredient_count > 0
	assert recipe_count > 0
