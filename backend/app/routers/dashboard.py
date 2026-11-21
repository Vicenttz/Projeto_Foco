from fastapi import APIRouter

from app.dependencies import CurrentUser, DbSession
from app.schemas.foco import DashboardOut
from app.services import dashboard_service

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])


@router.get("", response_model=DashboardOut)
def dashboard(db: DbSession, usuario: CurrentUser):
    return dashboard_service.montar(db, usuario)
