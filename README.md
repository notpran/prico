# Prico

A full-stack collaborative coding platform with real-time chat, community management, project collaboration, and GitHub integration.

## Technology Stack

- **Frontend**: Next.js 15 with React 18, TypeScript, Tailwind CSS
- **Backend**: Node.js with Express.js, Socket.IO for real-time communication
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: Clerk for user management
- **UI Components**: Radix UI with custom styling

## Features

- **Real-time Chat**: Community channels with typing indicators and reactions
- **Community Management**: Create and join communities with role-based permissions
- **Project Collaboration**: Manage projects with GitHub repository integration
- **Friend System**: Send friend requests and manage social connections
- **GitHub Integration**: Track issues, pull requests, commits, and branches
- **User Profiles**: Customizable profiles with skills and preferences

## Quick Start

### Prerequisites

- Node.js 18+
- MongoDB (local or cloud instance)
- npm or yarn

### Setup

1. **Clone and install dependencies:**
   ```bash
   git clone <repository-url>
   cd prico
   npm run setup
   ```

2. **Configure environment variables:**
   Copy the `.env` file and update the values:
   ```env
   # Database
   MONGODB_URI=mongodb://localhost:27017/prico

   # Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
   CLERK_SECRET_KEY=your-clerk-secret

   # API URLs
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   NEXT_PUBLIC_SOCKET_URL=http://localhost:3001

   # JWT Secret
   JWT_SECRET=your-super-secret-jwt-key
   ```

3. **Start MongoDB:**
   Make sure MongoDB is running locally or update `MONGODB_URI` for your database.

4. **Run the full application:**
   ```bash
   npm run dev:full
   ```

   This will start both the Next.js frontend (http://localhost:3000) and Express backend (http://localhost:3001).

## Development Scripts

- `npm run dev` - Start frontend only
- `npm run dev:backend` - Start backend only
- `npm run dev:full` - Start both frontend and backend
- `npm run build:all` - Build both frontend and backend
- `npm run start:all` - Start both in production mode

## Project Structure

```
prico/
├── frontend/               # Next.js frontend
│   ├── src/
│   │   ├── app/           # Next.js app router
│   │   ├── components/    # React components
│   │   ├── hooks/         # Custom React hooks
│   │   └── lib/           # Utilities and configurations
│   └── package.json
├── backend/                # Express.js backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Express middleware
│   ├── config/            # Database and config
│   └── server.js          # Main server file
├── .env                    # Environment variables (shared)
└── package.json           # Root package.json with scripts
```

## API Documentation

The backend provides RESTful APIs for:

- **Authentication**: User registration and JWT token management
- **Users**: Profile management and user search
- **Communities**: Community creation, membership, and channel management
- **Projects**: Project collaboration with GitHub integration
- **Friends**: Social features and relationship management
- **Messages**: Real-time messaging with WebSocket support

See `backend/README.md` for detailed API documentation.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

4. The React app will be available at:
   - http://localhost:5173

## Features

- **User Authentication**: JWT-based authentication
- **Chat Systems**: Real-time messaging using Socket.IO (to be implemented)
- **Project Management**: (to be implemented)
- **File Management**: (to be implemented)
- **Pull Requests**: (to be implemented)
