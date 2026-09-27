# FastAPI POS Backend

This backend replaces Firebase and uses FastAPI + MongoDB to handle:
1. **Authentication** (JWT token-based Login/Register)
2. **Data Sync** (Saving and retrieving the entire Zustand POS state to MongoDB)

## Prerequisites
- Python 3.9+
- MongoDB running locally on port `27017` (or provide `MONGO_URL` environment variable)

## Setup & Run

1. **Install dependencies:**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows use `venv\Scripts\activate`
   pip install -r requirements.txt
   ```

2. **Start the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```
   The API will be available at `http://localhost:8000`.

## API Endpoints
- `POST /api/auth/register` : Register a new user (requires `email` and `password`).
- `POST /api/auth/login` : Login (OAuth2 Password flow, returns `access_token`).
- `GET /api/auth/me` : Get current user details.
- `GET /api/store` : Get the latest POS state from MongoDB.
- `POST /api/store` : Update the POS state in MongoDB.
- `DELETE /api/store` : Clear all data (used during factory reset).
