import dotenv from 'dotenv';

dotenv.config();

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '4000', 10),
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/prico',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  INTERNAL_JWT_SECRET: process.env.INTERNAL_JWT_SECRET || 'dev_secret_change_me',
  ALLOW_START_WITHOUT_DB: process.env.ALLOW_START_WITHOUT_DB === '1'
};

export function assertEnv() {
  if (!env.CLERK_SECRET_KEY) {
    console.warn('[env] Missing CLERK_SECRET_KEY - Clerk auth validation will fail.');
  }
}
