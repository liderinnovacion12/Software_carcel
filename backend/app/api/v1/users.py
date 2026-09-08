from fastapi import APIRouter, Depends

from app.api.deps import get_current_user
from app.schemas.user import CurrentUser

router = APIRouter(prefix="/users", tags=["usuarios"])


@router.get("/me", response_model=CurrentUser)
def read_current_user(current_user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    return current_user
