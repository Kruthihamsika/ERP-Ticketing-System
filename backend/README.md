# ERP Ticket Management System Backend

Phase 1 backend foundation for a production-quality ERP Ticket Management System.

## Stack

- FastAPI
- PostgreSQL
- SQLAlchemy 2.0
- Alembic
- Pydantic
- Python-dotenv

## Project Structure

```text
backend/
├── app/
│   ├── main.py
│   ├── core/
│   │   └── config.py
│   ├── database/
│   │   ├── base.py
│   │   └── connection.py
│   ├── models/
│   │   ├── activity_log.py
│   │   ├── comment.py
│   │   ├── enums.py
│   │   ├── ticket.py
│   │   └── user.py
│   ├── routes/
│   ├── schemas/
│   ├── services/
│   └── utils/
├── alembic/
│   ├── env.py
│   ├── script.py.mako
│   └── versions/
│       └── 20260615_0001_initial_schema.py
├── .env.example
├── alembic.ini
├── README.md
└── requirements.txt
```

## Setup

Create and activate a virtual environment:

```bash
python -m venv .venv
```

Windows PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

macOS or Linux:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Create a local environment file:

```bash
cp .env.example .env
```

Update `DATABASE_URL` in `.env` for your PostgreSQL database. The same variable can later point to a Neon PostgreSQL connection string.

Example local value:

```env
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/erp_ticketing
```

## Database

Create the PostgreSQL database before running migrations:

```sql
CREATE DATABASE erp_ticketing;
```

Run migrations from the `backend` directory:

```bash
alembic upgrade head
```

Generate future migrations after model changes:

```bash
alembic revision --autogenerate -m "describe change"
```

## Run The API

Start the FastAPI server from the `backend` directory:

```bash
uvicorn app.main:app --reload
```

The API will be available at:

- `http://127.0.0.1:8000`
- `http://127.0.0.1:8000/health`
- `http://127.0.0.1:8000/docs`

## Current Scope

Included in Phase 1:

- FastAPI application foundation
- Environment-based configuration
- SQLAlchemy session management
- PostgreSQL UUID primary keys
- PostgreSQL ENUM types
- User, Ticket, Comment, and ActivityLog models
- Model relationships with `back_populates`
- Alembic setup and initial migration
- CORS middleware
- Root and health endpoints

Not included in Phase 1:

- Authentication
- JWT
- Login or registration
- Ticket APIs
- Business logic
- AI features
- Dashboard APIs
