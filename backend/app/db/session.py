from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings


class Database:
    """Simple holder for the motor client and database."""
    client: AsyncIOMotorClient | None = None
    database = None


db = Database()
database = None  # Global reference for CRUD modules


async def get_database():
    """Return the connected Motor database instance (or None if not connected)."""
    return db.database


async def connect_to_mongo():
    """Create database connection."""
    global database
    if db.client is None:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        # Explicitly specify the database name
        db.database = db.client["prico"]
        database = db.database


async def close_mongo_connection():
    """Close database connection."""
    if db.client:
        db.client.close()


async def close_mongo_connection():
    """Close database connection."""
    if db.client:
        db.client.close()
        db.client = None
        db.database = None
