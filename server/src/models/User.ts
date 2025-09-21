import { Schema, model, Document } from 'mongoose';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String, required: true },
  age: { type: Number, required: true },
  passwordHash: { type: String, required: true },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export interface IUser extends Document {
    email: string;
    username: string;
    displayName: string;
    age: number;
    passwordHash: string;
    emailVerified: boolean;
    createdAt: Date;
}

export const User = model<IUser>('User', userSchema);
