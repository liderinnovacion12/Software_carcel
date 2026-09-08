from fastapi import APIRouter

from app.api.v1 import auth, calculations, dashboard, establishments, persons, search, users

api_v1_router = APIRouter()

api_v1_router.include_router(auth.router)
api_v1_router.include_router(users.router)
api_v1_router.include_router(persons.router)
api_v1_router.include_router(search.router)
api_v1_router.include_router(calculations.router)
api_v1_router.include_router(calculations.meta_router)
api_v1_router.include_router(dashboard.router)
api_v1_router.include_router(establishments.router)
