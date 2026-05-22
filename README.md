# DevPulse API

A collaborative backend platform for software teams to report bugs, suggest features, and manage issue workflows.

---

# Live URL

bash
https://devpules.vercel.app/

Features
User registration and login with JWT authentication
Role-based authorization system
Create bug reports and feature requests
Retrieve all issues with filtering and sorting
Get single issue details
Update issues with permission control
Delete issues (maintainer only)
Secure password hashing using bcrypt
PostgreSQL database with raw SQL queries
Modular Express.js architecture
Strict TypeScript implementation
Centralized response handling

# Tech Stack
Node.js
TypeScript
Express.js
PostgreSQL
pg
bcrypt
jsonwebtoken
dotenv
cors



# File Structor
DEVPULSE/
│
├── node_modules/
│
├── src/
│   │
│   ├── app/
│   │   │
│   │   ├── config/
│   │   │   └── index.ts
│   │   │
│   │   ├── db/
│   │   │   └── index.ts
│   │   │
│   │   ├── middleware/
│   │   │   ├── auth.ts
│   │   │   ├── globalErrorHandler.ts
│   │   │   └── index.d.ts
│   │   │
│   │   ├── modules/
│   │   │   │
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.interface.ts
│   │   │   │   ├── auth.route.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.validation.ts
│   │   │   │
│   │   │   └── issue/
│   │   │       ├── issue.controller.ts
│   │   │       ├── issue.interface.ts
│   │   │       ├── issue.route.ts
│   │   │       ├── issue.service.ts
│   │   │       └── issue.validation.ts
│   │   │
│   │   ├── types/
│   │   │   └── types.ts
│   │   │
│   │   └── utility/
│   │       ├── catchAsync.ts
│   │       ├── getErrorMessage.ts
│   │       └── sendResponse.ts
│   │
│   ├── app.ts
│   └── server.ts
│
├── .env
├── .gitignore
├── package.json
├── package-lock.json
├── tsconfig.json
└── README.md

#  Clone Repository
[git clone https://github.com/your-username/devpulse-api.git](https://github.com/sifat-arch/devpulse.git)

# Install Dependencies
npm install

# Create Environment Variables
Create a .env file in the root directory.
DB_CONNECT_STR=**************
PORT=5000
SECRET=KJDDFHDAHADJLKFHAD

# Run Development Server
npm run dev

# Database Schema
Users Table
| Field      | Type               |
| ---------- | ------------------ |
| id         | SERIAL PRIMARY KEY |
| name       | VARCHAR            |
| email      | VARCHAR UNIQUE     |
| password   | TEXT               |
| role       | VARCHAR            |
| created_at | TIMESTAMP          |
| updated_at | TIMESTAMP          |

Issues Table
| Field       | Type               |
| ----------- | ------------------ |
| id          | SERIAL PRIMARY KEY |
| title       | VARCHAR(150)       |
| description | TEXT               |
| type        | VARCHAR            |
| status      | VARCHAR            |
| reporter_id | INTEGER            |
| created_at  | TIMESTAMP          |
| updated_at  | TIMESTAMP          |

#Authentication
JWT-based authentication system is used.

After login, clients must send:
   Authorization: <JWT_TOKEN>
inside request headers for protected routes.

#API Endpoints
POST /api/auth/signup
Request Body
{
  "name": "John Doe",
  "email": "john.doe@devpulse.com",
  "password": "securePassword123",
  "role": "contributor"
}

Login User
POST /api/auth/login
Request Body
{
  "email": "john.doe@devpulse.com",
  "password": "securePassword123"
}

Issues Routes
Create Issue
POST /api/issues
Protected Route
Request Body
{
  "title": "Database connection timeout under load",
  "description": "Pool exhausts after 50+ concurrent queries",
  "type": "bug"
}
Get All Issues
GET /api/issues
Query Parameters
Param	Values
sort	newest, oldest
type	bug, feature_request
status	open, in_progress, resolved

Example:

/api/issues?sort=newest&type=bug
Get Single Issue
GET /api/issues/:id
Update Issue
PATCH /api/issues/:id
Protected Route
Request Body
{
  "title": "Updated issue title",
  "description": "Updated issue description",
  "type": "bug"
}
Delete Issue
DELETE /api/issues/:id
Protected Route


# User Roles

contributor
Register & login
Create issues
View all issues

maintainer
All contributor permissions
Update issues
Delete issues
Change issue status
Access system metrics


# Common Response Structure
Success Response
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}

Error Response
{
  "success": false,
  "message": "Something went wrong",
  "errors": {}
}
