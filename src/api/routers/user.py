from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.controllers import user as controller
from src.api.dependencies.database import get_db
from src.api.schemas.user import UserCreate, UserUpdate, UserRead

router = APIRouter(prefix="/users", tags=["Users"])


@router.post("/", response_model=UserRead)
def create(request: UserCreate, db: Session = Depends(get_db)):
	return controller.create(db, request)


@router.get("/{user_id}", response_model=UserRead)
def read_one(user_id: int, db: Session = Depends(get_db)):
	return controller.read_user_by_id(db, user_id)


@router.put("/{user_id}", response_model=UserRead)
def update(user_id: int, request: UserUpdate, db: Session = Depends(get_db)):
	return controller.update(db, user_id, request)


@router.delete("/{user_id}")
def delete(user_id: int, db: Session = Depends(get_db)):
	return controller.delete(db, user_id)
