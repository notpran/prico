# Prico
A full-stack collaborative coding app with chat systems and project management capabilities.

## Technology Stack

- **Frontend**: Flutter (web + desktop)
- **Backend**: FastAPI (Python) with Socket.IO for real-time communication
- **Database**: MongoDB

## Setup and Running

### Prerequisites

- Python 3.12+
- Flutter SDK
- MongoDB

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd /workspaces/prico/backend
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Start the FastAPI server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

4. The API documentation will be available at:
   - Swagger UI: http://localhost:8000/docs
   - ReDoc: http://localhost:8000/redoc

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd /workspaces/prico/frontend
   ```

2. Get Flutter dependencies:
   ```bash
   flutter pub get
   ```

3. Run the Flutter web app:
   ```bash
   flutter run -d web-server --web-hostname=0.0.0.0 --web-port=3000
   ```

4. The Flutter web app will be available at:
   - http://localhost:3000

## Features

- **User Authentication**: JWT-based authentication with email verification
- **Chat Systems**: Real-time messaging using Socket.IO
- **Project Management**: Create and manage coding projects
- **File Management**: View and edit code files
- **Pull Requests**: Create and manage pull requests
