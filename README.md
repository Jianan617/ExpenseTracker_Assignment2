# Advanced Expense Tracker Web Application

## Project Description

Advanced Expense Tracker is a single-page expense management web application. It allows users to register, log in, create and manage their own expense records, search and filter expenses in real time, and view monthly spending trends. The system also includes an Admin role that can manage users, manage categories, view all users' expense records, and review user activity logs.

The project extends the original Expense Tracker into a more complete real-world web application by adding authentication, role-based access control, activity tracking, and multiple database entities.

## Technology Stack

### Frontend
- React
- Vite
- JavaScript
- CSS
- Fetch API
- Local Storage for client-side session persistence

### Backend
- Node.js
- Express.js
- MySQL
- Node.js Crypto module for password hashing and signed JWT-style tokens

### Database
- MySQL

## Main Features

### Authentication and Security
- User registration
- User login
- Password hashing using PBKDF2 SHA-256
- Signed JWT-style authentication token
- Protected backend API routes
- Role-based access control for Admin-only features

### Expense Management
- Create expense
- Read expense list
- Update expense
- Delete expense
- Search by title, description, or username
- Filter by category
- Sort by amount
- Sort by date
- Monthly expenditure trend

### Admin Features
- View all users
- Update user profile and role
- Delete users with safety checks
- Manage categories
- View activity logs
- View all users' expenses

### Activity Tracking
The system records important actions such as:
- Register
- Login
- Logout
- Create expense
- Update expense
- Delete expense
- Create/update/delete category
- Update/delete user

## Database Entities

The project uses four conceptual entities:

1. `users`
   - Stores login accounts, email, password hash, and role.

2. `expenses`
   - Stores expense records and links each expense to a user.

3. `categories`
   - Stores category options used by expense forms and filters.

4. `user_activities`
   - Stores user activity logs for accountability and admin review.

## Folder Structure

```text
ExpenseTracker/
├── backend/
│   ├── src/
│   │   ├── config/          # MySQL database connection
│   │   ├── controllers/     # Request handling and business flow
│   │   ├── middleware/      # Authentication and admin access middleware
│   │   ├── models/          # Database query functions
│   │   ├── routes/          # API endpoint definitions
│   │   ├── utils/           # Password hashing, token signing, validation
│   │   ├── app.js           # Express app configuration
│   │   └── server.js        # Server entry point
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable modal components
│   │   ├── pages/           # Login, expenses, and admin pages
│   │   ├── services/        # API request functions
│   │   ├── styles/          # Global CSS
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
│
├── database/
│   └── expense_tracker_assignment2.sql
│
└── README.md
```

## How to Run the Application

### 1. Import the Database

Open MySQL and run:

```sql
SOURCE database/expense_tracker_assignment2.sql;
```

Alternatively, import the SQL file through MySQL Workbench or the IntelliJ IDEA Database tool.

### 2. Configure Backend Environment

Copy the example environment file:

```bash
cd backend
cp .env .env
```

Then update `.env` with your own MySQL details:

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expense_tracker
DB_PORT=3306
PORT=5000
JWT_SECRET=replace_this_with_a_long_random_secret
```

Do not commit `.env` to GitHub.

### 3. Install and Run Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

### 4. Install and Run Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on the URL shown by Vite, usually:

```text
http://localhost:5173
```

## Demo Accounts

```text
Admin account:
username: admin
password: admin123

User account:
username: user
password: user123
```

## API Overview

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/logout`

### Expenses
- `GET /api/expenses`
- `POST /api/expenses`
- `PUT /api/expenses/:id`
- `DELETE /api/expenses/:id`

### Categories
- `GET /api/categories`
- `POST /api/categories` Admin only
- `PUT /api/categories/:id` Admin only
- `DELETE /api/categories/:id` Admin only

### Admin
- `GET /api/admin/users`
- `PUT /api/admin/users/:id`
- `DELETE /api/admin/users/:id`
- `GET /api/admin/activities`

## Workload Allocation

This is an individual assignment.

Student: Jianan Huang

Main work completed:
- Frontend React interface
- Backend Node.js and Express REST API
- MySQL database design and export
- Authentication and role-based access control
- Expense CRUD
- Category management
- Admin user management
- User activity logs
- README and submission preparation

## Professional Practice Notes

- Sensitive environment variables are stored in `.env` and should not be committed.
- `.env.example` is provided to show required configuration fields.
- API routes use validation and error handling.
- User passwords are not stored as plain text.
- Admin-only routes are protected by role-based middleware.
