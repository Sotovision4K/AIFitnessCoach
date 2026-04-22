
from fastapi import APIRouter


from .workout_route import router as workout_router
from .health_check import router as health_router
from .users_route import router as users_router

v1_router = APIRouter(prefix="/api/v1")
v1_router.include_router(workout_router, prefix="/workout", tags=["workout"])
v1_router.include_router(health_router, prefix="/health", tags=["health"])
v1_router.include_router(users_router, prefix="/user", tags=["user"])