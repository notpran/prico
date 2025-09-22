import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

let db: Db;

import { MongoClient, Db } from 'mongodb';
import { userIndexes } from './models/user';

const uri = process.env.MONGODB_URI!;
const client = new MongoClient(uri);

let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (!db) {
    await client.connect();
    db = client.db('prico');
    await createIndexes(db);
  }
  return db;
}

async function createIndexes(db: Db) {
  const users = db.collection('users');
  for (const index of userIndexes) {
    await users.createIndex(index.key, index.options);
  }
  // Add other collections' indexes here as they are created
}

async function createIndexes(db: Db) {
  // Users indexes
  const users = db.collection('users');
  await users.createIndex({ username: 1 }, { unique: true });
  await users.createIndex({ clerkId: 1 }, { unique: true });

  // Communities indexes
  const communities = db.collection('communities');
  await communities.createIndex({ slug: 1 }, { unique: true });

  // Channels indexes
  const channels = db.collection('channels');
  await channels.createIndex({ communityId: 1, type: 1 });

  // Messages indexes
  const messages = db.collection('messages');
  await messages.createIndex({ channelId: 1, createdAt: -1 });

  // Projects indexes
  const projects = db.collection('projects');
  await projects.createIndex({ ownerId: 1, name: 1 }, { unique: true });
}