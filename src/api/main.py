from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.api.dependencies.database import Base, engine
from src.api.routers import index
from src.api.seed import seed_if_needed

# Ensure DB tables are created (SQLAlchemy models bound to Base)
Base.metadata.create_all(bind=engine)

# This provides sample data for demo purposes
seed_if_needed()

app = FastAPI()

origins = ["*"]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,
	allow_credentials=True,
	allow_methods=["*"],
	allow_headers=["*"],
)

index.load_routes(app)
