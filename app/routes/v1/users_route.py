


from fastapi import APIRouter, Depends, HTTPException, status

from app.adapters.dynamodb_adapters import DynamoDBAdapter
from app.config import Settings
from app.dependency import get_current_user, get_settings, get_dynamodb_resource, CurrentUser
from app.models.user import User

router = APIRouter()


def _get_repository(settings: Settings = Depends(get_settings), dynamodb=Depends(get_dynamodb_resource)) -> DynamoDBAdapter:
    return DynamoDBAdapter(settings, dynamodb)


@router.get("/get-profile")
async def get_profile(
    current_user: CurrentUser = Depends(get_current_user),
    repo: DynamoDBAdapter = Depends(_get_repository),
):
    profile = await repo.get_user_profile(current_user.user_id)
    if not profile:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User profile not found")
    return profile


@router.put("/profile")
async def create_profile(
    user: User,
    current_user: CurrentUser = Depends(get_current_user),
    repo: DynamoDBAdapter = Depends(_get_repository),
):
    
    sub = current_user.user_id

    user = User(
        name=user.name,
        onboardingComplete=True,
        email=current_user.email,  # Use email from authenticated user
        age=user.age,
        gender=user.gender,
        heightCm=user.height_cm,
        weightKg=user.weight_kg,
        fitnessLevel=user.fitness_level,
        goal=user.goal,
        daysPerWeek=user.days_per_week,
        sessionDurationMin=user.session_duration_min,
        gymAccessType=user.gym_access_type,
        equipment=user.equipment,
        includeAbs=user.include_abs,
        injuries=user.injuries,
        splitType=user.split_type,
        cardioIncluded=user.cardio_included,
        preferredCardio=user.preferred_cardio,
        additionalComments=user.additional_comments,
        language=user.language,
        squatKg=user.squat_1rm_kg,
        benchPressKg=user.bench_1rm_kg,
        deadliftKg=user.deadlift_1rm_kg,
    )
    
    await repo.save_user_profile(sub, user)

    return {"message": "User profile created successfully"}