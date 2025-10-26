import os
from typing import Generator

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.pool import StaticPool

DATABASE_URL = os.environ.get("DATABASE_URL", "sqlite:///./data.db")

if DATABASE_URL.startswith("sqlite:///:memory:"):
	engine = create_engine(
		DATABASE_URL,
		connect_args={"check_same_thread": False},
		poolclass=StaticPool,
	)
else:
	engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db() -> Generator[Session, None, None]:
	"""Provide a database session generator for FastAPI dependencies.

	Yields a Session and ensures it is closed after use.
	"""
	db = SessionLocal()
	try:
		yield db
	finally:
		db.close()
