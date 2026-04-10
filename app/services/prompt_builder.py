

from app.schemas.request import WorkoutGenerateRequest


def build_workout_prompt(request : WorkoutGenerateRequest) -> str:  
    """Build an English-language prompt for the Gemini LLM.

        Uses ternary inclusion — optional fields are only mentioned
        when they have values; the LLM never sees "missing" fields.
    """
    
    lines : list[str] = [
        f"Generate a workout plan based on the following user profile and preferences:",
        f"- Age: {request.age}",
        f"- Height: {request.height_cm} cm",
        f"- Weight: {request.weight_kg} kg",
        f"- Activity level: {request.activity_level.value}",
        f"- Gym days per week: {request.gym_days_per_week}",
        f"- Goals: {request.goals}",
    ]

    if not request.activity_level.value == "beginner":
        lines.append(f"- 1RM Squat: {request.squat_1rm_kg} kg" if request.squat_1rm_kg else "- 1RM Squat: N/A")
        lines.append(f"- 1RM Bench Press: {request.bench_1rm_kg} kg" if request.bench_1rm_kg else "- 1RM Bench Press: N/A")
        lines.append(f"- 1RM Deadlift: {request.deadlift_1rm_kg} kg" if request.deadlift_1rm_kg else "- 1RM Deadlift: N/A")

    if request.injuries:
        lines.append(f"- Injuries: {request.injuries}."
                        "Substitute contraindicated exercises with injury-appropriate "
                        "modifications at reduced load/RPE. Add a recovery-focused "
                        "note in the suggestion field for each affected exercise."
                 )
    
    if request.split_type:
        lines.append(f"- Preferred split type: {request.split_type.value}")
    
    if request.include_cardio:
        lines.append("- Include cardio: Yes")
    
    if request.include_abs:
        lines.append("- Include abs exercises: Yes")
    
    if request.activity_level.value == "beginner":
        lines.extend([
            "",
            "This user is a beginner. Use RPE-only guidance. "
            "Do NOT use percentage-based loading. "
            "Set weight_kg to 0 for bodyweight exercises or conservative "
            "defaults for barbell/dumbbell movements. "
            "Keep exercise selection simple and foundational.",
        ])
    
    split_desc = _get_split_description(request)
    lines.extend([
        "",
        split_desc,
        "",
        "For each session, order exercises as: "
        "compound exercises first, then complementary movements "
        "for the same compound, then accessories.",
        "",
        "Return the plan as a JSON object with this exact structure:",
        '{"sessions": [{"label": "<session_name>", "day_number": <int>, '
        '"exercises": [{"exercise": "<name>", "reps": <int>, "sets": <int>, '
        '"rpe": <int 1-10>, "weight_kg": <int>, '
        '"suggestion": "<focus description>"}]}]}',
        "",
        "Return ONLY valid JSON. No markdown, no explanation.",
    ])

    return "\n".join(lines)


def _get_split_description(request: WorkoutGenerateRequest) -> str:
    """Return a description of session structure for the chosen split."""
    split = request.split_type.value
    days = request.gym_days_per_week

    if split == "push_pull_legs":
        return (
            f"Generate a push/pull/legs split plan with {days} training days. "
            "Cycle through push, pull, and legs sessions across the training days."
        )

    if split == "upper_lower":
        return (
            f"Generate an upper/lower split plan with {days} training days. "
            "Sessions should be labeled Upper A, Upper B, Lower A, Lower B "
            "and cycled across the training days."
        )
    if split == "full_body":
        return (
            f"Generate a full-body split plan with {days} training days. "
            f"Each session should be a complete full-body workout labeled "
            f"Day 1 through Day {days}."
        )
    # bro_split
    return (
        f"Generate a bro split plan with {days} training days. "
        "Each session targets a specific muscle group (e.g., "
        "Chest & Triceps, Back & Biceps, Shoulders, Legs). "
        "Label each session with the target muscle group."
    )


