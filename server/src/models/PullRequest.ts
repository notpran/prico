import { Schema, model, Types, Document } from 'mongoose';

export interface IPullRequest extends Document {
    sourceRepo: Types.ObjectId;
    targetRepo: Types.ObjectId;
    sourceBranch: string;
    targetBranch: string;
    title: string;
    description?: string;
    status: 'open' | 'merged' | 'closed';
    authorId: Types.ObjectId;
    createdAt: Date;
}

const pullRequestSchema = new Schema<IPullRequest>({
  sourceRepo: { type: Types.ObjectId, ref: 'Repo', required: true },
  targetRepo: { type: Types.ObjectId, ref: 'Repo', required: true },
  sourceBranch: { type: String, required: true },
  targetBranch: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ['open', 'merged', 'closed'], default: 'open' },
  authorId: { type: Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const PullRequest = model<IPullRequest>('PullRequest', pullRequestSchema);
