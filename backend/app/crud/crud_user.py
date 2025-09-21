from app.db.session import database
from app.models.all import User
from app.schemas.all import UserCreate
from app.core.security import get_password_hash

async def get_user_by_email(email: str):
    return await database.users.find_one({"email": email})

async def create_user(user: UserCreate):
    hashed_password = get_password_hash(user.password)
    user_dict = user.dict()
    user_dict.pop("password")
    db_user = User(**user_dict, hashed_password=hashed_password)
    await database.users.insert_one(db_user.dict(by_alias=True))
    return db_user
