import motor.motor_asyncio
from app.core.config import settings

client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGO_DETAILS)

database = client.prico

async def connect_to_mongo():
    # Not needed with motor
    pass

async def close_mongo_connection():
    # Not needed with motor
    pass
