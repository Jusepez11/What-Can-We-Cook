from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from src.api.controllers import category as controller
from src.api.dependencies.database import get_db
from src.api.schemas.category import CategoryCreate, CategoryUpdate, CategoryRead
from src.api.util.auth import get_current_active_admin_user

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.post("/", response_model=CategoryRead, dependencies=[Depends(get_current_active_admin_user)])
def create(request: CategoryCreate, db: Session = Depends(get_db)):
	return controller.create(db, request)


@router.get("/", response_model=list[CategoryRead])
def read_all(db: Session = Depends(get_db)):
	return controller.read_all(db)


@router.get("/{category_id}", response_model=CategoryRead)
def read_one(category_id: int, db: Session = Depends(get_db)):
	return controller.read_one(db, category_id)


@router.put("/{category_id}", response_model=CategoryRead, dependencies=[Depends(get_current_active_admin_user)])
def update(category_id: int, request: CategoryUpdate, db: Session = Depends(get_db)):
	return controller.update(db, category_id, request)


@router.delete("/{category_id}", dependencies=[Depends(get_current_active_admin_user)])
def delete(category_id: int, db: Session = Depends(get_db)):
	return controller.delete(db, category_id)

