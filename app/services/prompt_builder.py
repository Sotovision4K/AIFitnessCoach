from app.models.user import User


def build_workout_prompt(request: User) -> str:
    """Build an English-language prompt from a User model instance.

    Uses ternary inclusion — optional fields are only mentioned
    when they have values; the LLM never sees "missing" fields.
    """
    fitness_level = request.fitness_level.value
    split_type = request.split_type.value
    days = request.days_per_week

    lines: list[str] = [
        "Generate a workout plan based on the following user profile and preferences:",
        f"- Age: {request.age}",
        f"- Height: {request.height_cm} cm",
        f"- Weight: {request.weight_kg} kg",
        f"- Fitness level: {fitness_level}",
        f"- Gym days per week: {days}",
        f"- Goal: {request.goal.value}",
        f"- Session duration: {request.session_duration_min} min",
        f"- Gym access: {request.gym_access_type.value}",
    ]

    if request.equipment:
        lines.append(f"- Available equipment: {', '.join(request.equipment)}")

    if fitness_level != "beginner":
        lines.append(
            f"- 1RM Squat: {request.squat_1rm_kg} kg"
            if request.squat_1rm_kg
            else "- 1RM Squat: N/A"
        )
        lines.append(
            f"- 1RM Bench Press: {request.bench_1rm_kg} kg"
            if request.bench_1rm_kg
            else "- 1RM Bench Press: N/A"
        )
        lines.append(
            f"- 1RM Deadlift: {request.deadlift_1rm_kg} kg"
            if request.deadlift_1rm_kg
            else "- 1RM Deadlift: N/A"
        )

    if request.injuries:
        lines.append(
            f"- Injuries: {', '.join(request.injuries)}. "
            "Substitute contraindicated exercises with injury-appropriate "
            "modifications at reduced load/RPE. Add a recovery-focused "
            "note in the suggestion field for each affected exercise."
        )

    lines.append(f"- Preferred split type: {split_type}")

    if request.cardio_included:
        lines.append(
            "- Include cardio: Yes"
            + (f" ({request.preferred_cardio})" if request.preferred_cardio else "")
        )

    if request.include_abs:
        lines.append("- Include abs exercises: Yes")

    if request.additional_comments:
        lines.append(f"- Additional comments: {request.additional_comments}")

    if fitness_level == "beginner":
        lines.extend(
            [
                "",
                "This user is a beginner. Use RPE-only guidance. "
                "Do NOT use percentage-based loading. "
                "Set weight_kg to 0 for bodyweight exercises or conservative "
                "defaults for barbell/dumbbell movements. "
                "Keep exercise selection simple and foundational.",
            ]
        )

    split_desc = _get_split_description(split_type, days)
    lines.extend(
        [
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
        ]
    )

    return "\n".join(lines)


def _get_split_description(split: str, days: int) -> str:
    """Return a description of session structure for the chosen split."""

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
