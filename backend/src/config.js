import dotenv from 'dotenv';
dotenv.config();

export const PORT = process.env.PORT || 8000;
export const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/prico_db';
export const DB_NAME = process.env.DB_NAME || undefined; // Not needed for full URI but kept for compatibility
export const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || '';
