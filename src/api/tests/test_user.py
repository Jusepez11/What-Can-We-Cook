import pytest
from unittest.mock import MagicMock, patch
from sqlalchemy.orm import Session
from fastapi import HTTPException
from src.api.controllers import user as controller
from api.schemas.user import UserCreate
from api.models.user import User
from sqlalchemy.exc import SQLAlchemyError

import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))


@pytest.fixture
def mock_db():
    return MagicMock(spec=Session)


@pytest.fixture
def sample_request():
    return UserCreate(
        username="Madona", email="Madona@aol.com", hashed_password="DefNotPassword123!"
    )


def test_create_user_success(mock_db, sample_request):
    mock_user = User(
        # id=1, I think it shouldn't need it, but well see ='(
        username=sample_request.username,
        email=sample_request.email,
        hashed_password=sample_request.hashed_password,
    )

    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()

    with patch("api.controllers.users.model.user", return_value=mock_user):
        result = controller.create(mock_db, sample_request)

    assert result.username == sample_request.username
    assert result.email == sample_request.email
    assert result.hashed_password == sample_request.hashed_password
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


def test_read_user_by_id_success(mock_db, sample_request):
    mock_user = User(
        # id=1, I think it shouldn't need it, but well see ='(
        username=sample_request.username,
        email=sample_request.email,
        hashed_password=sample_request.hashed_password,
    )

    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()

    with patch("api.controllers.users.model.user", return_value=mock_user):
        result = controller.read_user_by_id(mock_db, mock_user.id)

    assert result.username == sample_request.username
    assert result.email == sample_request.email
    assert result.hashed_password == sample_request.hashed_password
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


def test_read_user_by_email_success(mock_db, sample_request):
    mock_user = User(
        # id=1, I think it shouldn't need it, but well see ='(
        username=sample_request.username,
        email=sample_request.email,
        hashed_password=sample_request.hashed_password,
    )

    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()

    with patch("api.controllers.users.model.user", return_value=mock_user):
        result = controller.read_user_by_email(mock_db, mock_user.email)

    assert result.username == sample_request.username
    assert result.email == sample_request.email
    assert result.hashed_password == sample_request.hashed_password
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


def test_read_user_by_username_success(mock_db, sample_request):
    mock_user = User(
        # id=1, I think it shouldn't need it, but well see ='(
        username=sample_request.username,
        email=sample_request.email,
        hashed_password=sample_request.hashed_password,
    )

    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()

    with patch("api.controllers.users.model.user", return_value=mock_user):
        result = controller.read_user_by_username(mock_db, mock_user.username)

    assert result.username == sample_request.username
    assert result.email == sample_request.email
    assert result.hashed_password == sample_request.hashed_password
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


def test_update_user_success(mock_db, sample_request):
    mock_user = User(
        # id=1, I think it shouldn't need it, but well see ='(
        username="NotMadona",
        email="madona@gmail.com",
        hashed_password="ActuallyBadBunny123!",
    )

    mock_db.add = MagicMock()
    mock_db.commit = MagicMock()
    mock_db.refresh = MagicMock()

    with patch("api.controllers.users.model.user", return_value=mock_user):
        result = controller.read_user_by_id(mock_db, mock_user.id)

    assert result.username == mock_user.username
    assert result.email == mock_user.email
    assert result.hashed_password == mock_user.hashed_password
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()


def test_create_user_db_error(mock_db, sample_request):
    mock_db.add.side_effect = SQLAlchemyError("DB failure")

    with pytest.raises(HTTPException) as exc_info:
        controller.create(mock_db, sample_request)

    assert exc_info.value.status_code == 400
    assert "DB failure" in str(exc_info.value.detail)


def test_delete_user_success(mock_db, sample_request):

    with patch("api.controllers.users.model.user"):
        result = controller.delete(mock_db, sample_request.id)

    assert result
    mock_db.add.assert_called_once()
    mock_db.commit.assert_called_once()
    mock_db.refresh.assert_called_once()
