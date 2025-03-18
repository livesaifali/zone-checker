
# Zone Checker Backend

This is the backend API server for the Zone Checker application. It connects to a MySQL database and provides the API endpoints needed for the frontend.

## Database Setup

1. Make sure you have MySQL installed and running on your machine
2. Create a new database called `zone_checker_db` (or use the name you specified in your .env file)
3. Run the SQL script in `database_setup.sql` to create the necessary tables and initial data:

```bash
mysql -u root < database_setup.sql
```

Or if you prefer, you can copy and paste the SQL commands from the file into your MySQL client.

## Configuration

1. Check the `.env` file and update the database connection details if needed
2. Make sure to change the JWT_SECRET in production for security

## Installation

Install the required dependencies:

```bash
npm install
```

## Running the Server

Start the development server:

```bash
npm run dev
```

Or for production:

```bash
npm start
```

The server will run on port 3000 by default (or the port specified in your .env file).

## API Endpoints

- Auth:
  - POST `/api/auth/login` - Login with username and password
  - GET `/api/users/me` - Get current user info

- Users:
  - GET `/api/users` - Get all users (admin only)

- Cities:
  - GET `/api/cities` - Get all cities with their latest status
  - POST `/api/cities` - Create a new city (admin only)

- Status Updates:
  - POST `/api/status-update` - Update the status of a city
  - GET `/api/status-history/:cityId` - Get status history for a city

- Tasks:
  - GET `/api/tasks` - Get tasks (all for admin, assigned only for users)
  - POST `/api/tasks` - Create a new task (admin only)
  - PUT `/api/tasks/:id` - Update a task status
  - POST `/api/tasks/:id/comments` - Add a comment to a task

## Test Credentials

- Admin user:
  - Username: `admin`
  - Password: `admin123`

- City users:
  - Username: `karachi` (also: `lahore`, `islamabad`)
  - Password: `user123`

## Health Check

You can verify the database connection is working by visiting:
`http://localhost:3000/api/health`
