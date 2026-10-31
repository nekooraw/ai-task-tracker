# Mini Task Tracker with AI

A task management application with user authentication, task tracking and an AI assistant powered by Groq.

## Features

- User registration and login
- Secure password hashing
- JWT authentication
- Create, read, update and delete tasks (CRUD)
- Task descriptions
- Task priorities (Low, Medium, High)
- Task deadlines (date and time)
- Mark tasks as completed
- Search and filter tasks
- Personal task lists for each user
- AI assistant for task management and planning

## Tech Stack

### Backend
- Python 3.14
- FastAPI
- Uvicorn
- SQLAlchemy (async)
- SQLite
- Pydantic
- Alembic
- PyJWT
- pwdlib
- Groq API

### Frontend
- React
- JavaScript
- Vite
- CSS
- Axios

## Project Structure

```text
ai-task-tracker/
├── backend/
│   └── app/
│       ├── api/
│       ├── core/
│       ├── db/
│       ├── models/
│       ├── schemas/
│       ├── services/
│       └── main.py
├── frontend/
│   └── src/
├── migrations/
├── .env
├── .gitignore
├── alembic.ini
├── pyproject.toml
├── poetry.lock
└── README.md
```

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/nekooraw/ai-task-tracker.git
cd ai-task-tracker
```

### 2. Install backend dependencies

```bash
poetry install
```

### 3. Configure environment variables

Create a `.env` file in the project root:

```env
SECRET_KEY=your_secret_key
GROQ_API_KEY=your_groq_api_key
```

Replace the placeholder values with your own keys.

### 4. Apply database migrations

```bash
poetry run alembic upgrade head
```

### 5. Start the backend

```bash
poetry run uvicorn app.main:app --reload --app-dir backend
```

Backend runs at:

`http