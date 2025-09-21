import { Schema, model, Types, Document } from 'mongoose';

export interface IRepo extends Document {
  name: string;
  ownerId: Types.ObjectId;
  visibility: 'public' | 'private';
  forks: Types.ObjectId[];
  parentRepo?: Types.ObjectId;
  path: string;
  createdAt: Date;
}

const repoSchema = new Schema<IRepo>({
  name: { type: String, required: true },
  ownerId: { type: Types.ObjectId, ref: 'User', required: true },
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  forks: [{ type: Types.ObjectId, ref: 'Repo' }],
  parentRepo: { type: Types.ObjectId, ref: 'Repo' },
  path: { type: String, required: true, unique: true }, // Path on the server's filesystem
  createdAt: { type: Date, default: Date.now },
});

export const Repo = model<IRepo>('Repo', repoSchema);
