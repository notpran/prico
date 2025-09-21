from passlib.context import CryptContext
from app.db.session import database
from app import schemas

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password):
    return pwd_context.hash(password)

async def get_user_by_email(email: str):
    return await database.users.find_one({"email": email})

async def create_user(user_in: schemas.UserCreate):
    hashed_password = get_password_hash(user_in.password)
    user_data = {
        "email": user_in.email,
        "username": user_in.username,
        "hashed_password": hashed_password,
        "is_active": True
    }
    result = await database.users.insert_one(user_data)
    user_data["_id"] = result.inserted_id
    return user_data
