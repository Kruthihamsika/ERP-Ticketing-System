# 🎫 ERP Ticket Management System

A full-stack enterprise-grade Ticket Management Platform designed to streamline internal support operations across organizations. The system enables employees to raise tickets, agents to manage and resolve issues, and administrators to monitor workflows through real-time dashboards and analytics.

## 🌐 Live Demo

**Frontend:**
https://thunderous-strudel-4fe45b.netlify.app

**Backend API:**
https://erp-ticketing-system.onrender.com

**API Documentation:**
https://erp-ticketing-system.onrender.com/docs

---

# 📌 Project Overview

Organizations often struggle with tracking internal IT, HR, Finance, and Administration requests through emails and spreadsheets. This project provides a centralized ERP-style ticketing platform where employees can report issues, agents can resolve them, and administrators can monitor performance.

The system follows a complete ticket lifecycle from creation to closure while maintaining role-based access control and real-time operational visibility.

---

# 🚀 Key Features

## 🔐 Authentication & Authorization

* JWT-based authentication
* Secure password hashing using Bcrypt
* Role-Based Access Control (RBAC)
* Protected API endpoints
* Persistent login sessions

### Supported Roles

| Role     | Permissions                      |
| -------- | -------------------------------- |
| Employee | Create and track own tickets     |
| Agent    | Manage assigned tickets          |
| Admin    | Manage users, tickets, analytics |

---

## 🎫 Ticket Management

### Employees Can

* Create tickets
* View ticket status
* Track ticket progress
* View resolution notes

### Agents Can

* View assigned tickets
* Update ticket status
* Add resolution notes
* Resolve issues

### Admins Can

* View all tickets
* Assign tickets to agents
* Monitor system performance
* Access analytics dashboard

---

# 🔄 Ticket Lifecycle

```text
OPEN
  ↓
ASSIGNED
  ↓
IN_PROGRESS
  ↓
RESOLVED
  ↓
CLOSED
```

Additional State:

```text
REJECTED
```

---

# 🏢 Supported Departments

* IT
* HR
* Finance
* Administration

---

# 🚨 Ticket Priorities

* LOW
* MEDIUM
* HIGH
* CRITICAL

---

# 📊 Analytics Dashboard

The dashboard provides real-time operational insights including:

* Total Tickets
* Open Tickets
* Assigned Tickets
* In Progress Tickets
* Resolved Tickets
* Closed Tickets

### Visual Analytics

* Status Distribution
* Priority Distribution
* SLA Tracking
* Resolution Trends

---

# 🛠️ Tech Stack

## Frontend

* React
* TypeScript
* Vite
* React Router
* React Query
* Axios
* React Hook Form
* Tailwind CSS
* Lucide React

## Backend

* FastAPI
* SQLAlchemy
* Alembic
* Pydantic
* JWT Authentication
* Passlib
* Bcrypt

## Database

* PostgreSQL

## Deployment

### Frontend

* Netlify

### Backend

* Render

### Version Control

* Git
* GitHub

---

# 🏗️ System Architecture

```text
┌─────────────────────────────┐
│        React Frontend       │
│  TypeScript + Tailwind CSS  │
└──────────────┬──────────────┘
               │
               │ REST API
               ▼
┌─────────────────────────────┐
│       FastAPI Backend       │
│ Authentication + Business   │
│ Logic + Role Management     │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│         PostgreSQL          │
│          Database           │
└─────────────────────────────┘
```

---

# 📂 Project Structure

```text
ERP-Ticketing-System
│
├── backend
│   ├── alembic
│   ├── app
│   │   ├── core
│   │   ├── database
│   │   ├── models
│   │   ├── routes
│   │   ├── schemas
│   │   └── services
│   │
│   ├── requirements.txt
│   └── runtime.txt
│
├── frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   ├── layouts
│   │   ├── hooks
│   │   └── routes
│   │
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

---

# 🧩 Core Modules

## User Management

* User Registration
* User Login
* Role Assignment
* Authentication

## Ticket Management

* Create Ticket
* Update Ticket
* Assign Ticket
* Resolve Ticket
* Close Ticket

## Analytics

* Ticket Statistics
* Status Analytics
* Priority Analytics
* SLA Monitoring

## Attachments

* Upload Files
* Download Files
* Ticket-Level Storage



# 🧪 Demo Credentials

## Admin

```text
Email:kruthi@test.com
Password: password123
```

## Agent

```text
Email: ananya.hr@company.com
Password: password123
```

## Employee

```text
Email: arjun.mehta@company.com
Password: password123
```

⚠️ Replace these with actual credentials only if they exist in your deployed database.

---

# ⚙️ Local Setup

## Clone Repository

```bash
git clone https://github.com/Kruthihamsika/ERP-Ticketing-System.git

cd ERP-Ticketing-System
```

---

## Backend Setup

```bash
cd backend

python -m venv venv

venv\Scripts\activate

pip install -r requirements.txt

uvicorn app.main:app --reload
```

Backend runs on:

```text
http://localhost:8000
```

---

## Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---


# 🔮 Future Enhancements

* Email Notifications
* Ticket Comments & Discussions
* SLA Escalation Engine
* AI-Powered Ticket Categorization
* Automated Agent Assignment
* Real-Time Notifications
* Audit Logs
* Mobile Application
* Department-Specific Dashboards



⭐ If you found this project useful, consider giving it a star on GitHub.
