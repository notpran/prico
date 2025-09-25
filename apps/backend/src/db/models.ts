import mongoose, { Schema, Types } from 'mongoose';

const UserSchema = new Schema({
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  displayName: { type: String },
  aboutMe: { type: String },
  age: { type: Number, required: true },
  badges: { type: [String], default: [] },
  friends: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  projects: { type: [Schema.Types.ObjectId], ref: 'Project', default: [] },
  communities: { type: [Schema.Types.ObjectId], ref: 'Community', default: [] },
}, { timestamps: true });

const CommunitySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String },
  icon: { type: String },
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  roles: [{ userId: { type: Schema.Types.ObjectId, ref: 'User' }, role: { type: String } }],
  members: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  channels: [{ channelId: { type: Schema.Types.ObjectId, default: () => new Types.ObjectId() }, name: String, type: { type: String, enum: ['text','voice','video'], default: 'text' } }],
  visibility: { type: String, enum: ['public','private'], default: 'public' }
}, { timestamps: true });

const MessageSchema = new Schema({
  senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  channelId: { type: Schema.Types.ObjectId, ref: 'Community.channels.channelId' },
  dmId: { type: Schema.Types.ObjectId },
  content: { type: String, required: true },
  attachments: { type: [String], default: [] },
  reactions: [{ emoji: String, userId: { type: Schema.Types.ObjectId, ref: 'User' } }],
}, { timestamps: true });

const ProjectSchema = new Schema({
  ownerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  description: { type: String },
  visibility: { type: String, enum: ['public','private'], default: 'public' },
  files: [{ path: String, content: String }],
  contributors: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  forks: { type: [Schema.Types.ObjectId], ref: 'Project', default: [] },
  pullRequests: { type: [Schema.Types.ObjectId], ref: 'PullRequest', default: [] },
}, { timestamps: true });

const PullRequestSchema = new Schema({
  projectId: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  creatorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  changes: { type: Schema.Types.Mixed, required: true },
  status: { type: String, enum: ['open','merged','closed'], default: 'open' }
}, { timestamps: true });

const NotificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true },
  data: { type: Schema.Types.Mixed },
  read: { type: Boolean, default: false }
}, { timestamps: true });

export const UserModel = mongoose.model('User', UserSchema);
export const CommunityModel = mongoose.model('Community', CommunitySchema);
export const MessageModel = mongoose.model('Message', MessageSchema);
export const ProjectModel = mongoose.model('Project', ProjectSchema);
export const PullRequestModel = mongoose.model('PullRequest', PullRequestSchema);
export const NotificationModel = mongoose.model('Notification', NotificationSchema);
