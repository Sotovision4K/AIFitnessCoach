


from fastapi import APIRouter, Depends


from app.dependency import get_current_user
from app.models.user import User

router = APIRouter()


@router.put("/profile")
async def create_profile(user: User, current_user: str = Depends(get_current_user)):
    print("Current user:", current_user)
    user = User(
        name=user.name,
        email=user.email,
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
        benchKg=user.bench_1rm_kg,
        deadliftKg=user.deadlift_1rm_kg,
        )

    return {"message": "User profile created successfully"}