# src/lambdas/post_confirmation/handler.py
import os
import json
import logging
from datetime import datetime, timezone
from uuid import uuid4

import boto3
from botocore.exceptions import ClientError

logger = logging.getLogger()
logger.setLevel(logging.INFO)

TABLE_NAME = os.environ.get("USERS_TABLE_NAME")

if not TABLE_NAME:
    raise ValueError("Missing USERS_TABLE_NAME environment variable")

dynamodb = boto3.resource("dynamodb")
table = dynamodb.Table(TABLE_NAME) < w


def lambda_handler(event: dict, context) -> dict:
    """
    Cognito Post Confirmation Lambda Trigger.
    Creates a user profile in DynamoDB after successful sign-up confirmation.
    """
    logger.info("Post Confirmation Event: %s", json.dumps(event, indent=2))

    trigger_source = event.get("triggerSource", "")
    if trigger_source != "PostConfirmation_ConfirmSignUp":
        logger.info("Skipping trigger source: %s", trigger_source)
        return event

    user_attributes = event.get("request", {}).get("userAttributes", {})

    now = datetime.now(timezone.utc).isoformat()

    user_profile = {
        "userId": user_attributes.get("sub"),
        "email": user_attributes.get("email", ""),
        "onboardingComplete": False,
        "created_at": now,
        "updatedAt": now,
        # personalInfo
        "name": user_attributes.get("name", ""),
        "age": None,
        "gender": None,
        "heightCm": None,
        "weightKg": None,
        # fitnessProfile
        "fitnessLevel": None,
        "goal": None,
        "daysPerWeek": None,
        "sessionDurationMin": None,
        # equipment
        "gymAccessType": None,
        "equipment": [],
        "includeAbs": False,
        "injuries": [],
        # preferences
        "splitType": None,
        "cardioIncluded": False,
        "preferredCardio": "",
        "additionalComments": "",
        "language": "en",
        "squatKg": None,
        "benchPressKg": None,
        "deadliftKg": None,
    }

    try:
        table.put_item(
            Item=user_profile,
            # Prevent overwriting if user already exists
            ConditionExpression="attribute_not_exists(userId)",
        )
        logger.info("User profile created for: %s", user_profile["userId"])

    except ClientError as e:
        if e.response["Error"]["Code"] == "ConditionalCheckFailedException":
            logger.info("User profile already exists for: %s", user_profile["userId"])
            return event

        logger.error("Error creating user profile: %s", str(e))
        raise

    # IMPORTANT: Always return the event object back to Cognito
    return event
