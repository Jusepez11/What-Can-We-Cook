from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from src.api.schemas.user import UserCreate,UserUpdate,UserRead
from src.api.controllers import user as controller
from src.api.dependencies.database import get_db

router = APIRouter(prefix="/users", tags=["Users"])

@router.post("/", response_model=UserRead)
def create(request: UserCreate, db: Session = Depends(get_db)):
    return controller.create(db, request)

@router.get("/", response_model=list[UserRead])
def read_all(db: Session = Depends(get_db)):
    return controller.read_all(db)

#can be changed/adjusted to be able to search based off email/username too, but idk if needed/wanted, if so lmk and I can change it
@router.get("/{user_id}", response_model=UserRead)
def read_one(user_id: int, db: Session = Depends(get_db)):
    return controller.read_one(db, user_id)

@router.put("/{user_id}", response_model=UserRead)
def update(user_id: int, request: UserUpdate, db: Session = Depends(get_db)):
    return controller.update(db, user_id, request)

@router.delete("/{user_id}")
def delete(user_id: int, db: Session = Depends(get_db)):
    return controller.delete(db, user_id)