# Prico
A full-stack collaborative coding app with chat systems and project management capabilities.

## Technology Stack

- **Frontend**: React with Vite
- **Backend**: FastAPI (Python) with Socket.IO for real-time communication
- **Database**: MongoDB

## Setup and Running

### Prerequisites

- Python 3.12+
- Node.js and npm
- MongoDB

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   uvicorn app.main:socket_app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run the React app:
   ```bash
   npm run dev
   ```

4. The React app will be available at:
   - http://localhost:5173

## Features

- **User Authentication**: JWT-based authentication
- **Chat Systems**: Real-time messaging using Socket.IO (to be implemented)
- **Project Management**: (to be implemented)
- **File Management**: (to be implemented)
- **Pull Requests**: (to be implemented)
