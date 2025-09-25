import mongoose from 'mongoose';
import { env } from '../config/env';

export async function initMongo() {
  try {
    await mongoose.connect(env.MONGO_URI, { autoIndex: true });
    console.log('[db] connected');
  } catch (err) {
    console.error('[db] connection error', err);
    throw err;
  }
}
