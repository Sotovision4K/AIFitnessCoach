from fastapi import APIRouter, Depends, HTTPException, status

from app.adapters.dynamodb_adapters import DynamoDBAdapter
from app.config import Settings
from app.dependency import (
    get_current_user,
    get_settings,
    get_dynamodb_resource,
    CurrentUser,
)
from app.models.user import User
from app.schemas.request import ProfileUpsertRequest

router = APIRouter()


def _get_repository(
    settings: Settings = Depends(get_settings), dynamodb=Depends(get_dynamodb_resource)
) -> DynamoDBAdapter:
    return DynamoDBAdapter(settings, dynamodb)


@router.get("/get-profile")
async def get_profile(
    current_user: CurrentUser = Depends(get_current_user),
    repo: DynamoDBAdapter = Depends(_get_repository),
):
    profile = await repo.get_user_profile(current_user.user_id)
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found"
        )
    return profile


@router.put("/profile")
async def upsert_profile(
    payload: ProfileUpsertRequest,
    current_user: CurrentUser = Depends(get_current_user),
    repo: DynamoDBAdapter = Depends(_get_repository),
):
    """Create or update the authenticated user's profile.

    Server-controlled fields (userId, email, onboarded) are injected here and
    cannot be set by the client.
    """
    user = User(
        userId=current_user.user_id,
        email=current_user.email,
        onboardingComplete=True,
        **payload.model_dump(by_alias=True),
    )

    await repo.save_user_profile(current_user.user_id, user)

    return {"message": "User profile saved successfully"}
