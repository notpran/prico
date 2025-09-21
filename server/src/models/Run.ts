import { Schema, model, Types } from 'mongoose';

const runSchema = new Schema({
  language: { type: String, required: true },
  code: { type: String, required: true },
  stdin: { type: String },
  stdout: { type: String },
  stderr: { type: String },
  exitCode: { type: Number },
  status: { type: String, enum: ['pending', 'running', 'completed', 'error'], default: 'pending' },
  runId: { type: String, required: true, unique: true },
  userId: { type: Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Run = model('Run', runSchema);
