# Prico - Full-Stack Collaborative Coding Platform

Prico is a full-stack application that combines the best features of Discord (chat/communities), VSCode (collaborative coding/execution), and GitHub (project publishing/forks/PRs). It provides a comprehensive platform for developers to connect, collaborate, and create together in real-time.

## Features

- **User Accounts & Authentication**: Sign up, log in, verify email, and reset passwords using Clerk
- **Communities**: Create and join communities with text, voice, and video channels
- **Chat System**: Real-time messaging with WebSockets, including typing indicators, reactions, and file uploads
- **Voice & Video Chat**: Real-time communication using WebRTC
- **Projects**: Create, fork, and collaborate on coding projects
- **Collaborative Code Editor**: Real-time collaborative editing with Monaco Editor and Yjs
- **Code Execution**: Execute code in a secure Docker sandbox
- **Git Integration**: Pull requests, forks, and project publishing
- **Notifications**: Real-time notifications for friend requests, mentions, PR updates, and more

## Tech Stack

### Frontend
- Next.js
- React
- TailwindCSS
- Shadcn UI
- Monaco Editor
- Yjs/CRDT for collaborative editing
- WebRTC for voice/video
- WebSockets for real-time features

### Backend
- Python FastAPI
- MongoDB Atlas
- Clerk Authentication
- WebSockets
- Docker for code execution

## Getting Started

### Prerequisites

- Node.js (18.x or higher)
- Python (3.9 or higher)
- Docker and Docker Compose
- MongoDB (or use the provided Docker Compose setup)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/prico.git
   cd prico
   ```

2. Set up environment variables:
   - Copy `.env.example` to `.env` in the backend directory
   - Copy `.env.example` to `.env.local` in the frontend directory
   - Fill in the required values

3. Run with Docker Compose:
   ```
   docker-compose up
   ```

4. Or run the services separately:

   Backend:
   ```
   cd backend
   pip install -r requirements.txt
   uvicorn main:app --reload
   ```

   Frontend:
   ```
   cd frontend
   npm install
   npm run dev
   ```

5. Access the application:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

## Project Structure

```
prico/
├── backend/                # Python FastAPI Backend
│   ├── routers/            # API routes
│   ├── models.py           # Data models
│   ├── database.py         # MongoDB connection and operations
│   ├── main.py             # Main application
│   ├── requirements.txt    # Python dependencies
│   └── Dockerfile          # Backend Docker configuration
├── frontend/               # Next.js Frontend
│   ├── app/                # Next.js App Router
│   ├── components/         # React components
│   ├── lib/                # Utility functions
│   ├── public/             # Static files
│   └── Dockerfile          # Frontend Docker configuration
└── docker-compose.yml      # Docker Compose configuration
```

## Development

### API Documentation

The API documentation is available at http://localhost:8000/docs when the backend is running.

### WebSocket Endpoints

- Chat: `/chat/ws/{client_id}`
- Notifications: `/notifications/ws/{user_id}`
- RTC (Voice/Video): `/rtc/ws/{room_id}/{user_id}/{username}`
- Collaborative Editor: `/editor/ws/{file_id}/{user_id}/{username}`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- [Next.js](https://nextjs.org/)
- [FastAPI](https://fastapi.tiangolo.com/)
- [MongoDB](https://www.mongodb.com/)
- [Clerk](https://clerk.dev/)
- [TailwindCSS](https://tailwindcss.com/)
- [Shadcn UI](https://ui.shadcn.com/)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Yjs](https://yjs.dev/)
- [WebRTC](https://webrtc.org/)
- [Docker](https://www.docker.com/)