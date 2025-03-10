
# City Status Management System

A web application for managing city status updates across different regions, with user authentication and role-based access control.

## Project info

**URL**: https://lovable.dev/projects/9659ae2a-ed91-4a12-b562-b5eae4a1835c

## Login Credentials

**Admin (Master) User:**
- Username: `admin`
- Password: `admin123`

**City (Zone) Users:**
- Example:
  - Username: `karachi` 
  - Password: `user123`

## Features

- User authentication with admin and city-specific roles
- City status management (pending/uploaded)
- Comments and status history tracking
- Responsive design with dark mode support
- Admin panel for user management
- Reporting functionality
- Status update history

## MySQL Implementation Guide

The application is currently using mock data. To implement MySQL:

### Database Setup

1. Create a MySQL database
2. Set up the following tables:

```sql
-- Users table
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL, -- Store hashed passwords
  email VARCHAR(100),
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  concern_id VARCHAR(20) NOT NULL,
  last_login DATETIME
);

-- Cities/Zones table
CREATE TABLE cities (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  concern_id VARCHAR(20) NOT NULL UNIQUE
);

-- Status updates table
CREATE TABLE status_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  status ENUM('pending', 'uploaded') NOT NULL,
  comment TEXT,
  updated_by INT NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);

-- Status history table
CREATE TABLE status_history (
  id INT AUTO_INCREMENT PRIMARY KEY,
  city_id INT NOT NULL,
  status ENUM('pending', 'uploaded') NOT NULL,
  comment TEXT,
  updated_by INT NOT NULL,
  updated_at DATETIME NOT NULL,
  FOREIGN KEY (city_id) REFERENCES cities(id),
  FOREIGN KEY (updated_by) REFERENCES users(id)
);
```

3. Insert initial data:

```sql
-- Insert admin user
INSERT INTO users (username, password, role, concern_id, email) 
VALUES ('admin', 'admin123', 'admin', 'ADMIN', 'admin@example.com');

-- Insert cities
INSERT INTO cities (name, concern_id) VALUES
('Karachi', 'KHI001'),
('Lahore', 'LHR001'),
('Islamabad', 'ISB001'),
('Hyderabad', 'HYD001'),
('Sukkur', 'SUK001'),
('Larkana', 'LRK001'),
('Rawalpindi', 'RWP001'),
('Head Office', 'HQ001');

-- Insert city users
INSERT INTO users (username, password, role, concern_id, email) VALUES
('karachi', 'user123', 'user', 'KHI001', 'karachi@example.com'),
('lahore', 'user123', 'user', 'LHR001', 'lahore@example.com'),
('islamabad', 'user123', 'user', 'ISB001', 'islamabad@example.com');
```

### Backend Implementation

For a full MySQL implementation, you would need to:

1. Set up a backend server using Node.js with Express
2. Create API endpoints for:
   - User authentication
   - User management
   - City status updates
   - Reporting
3. Connect to MySQL database using a library like mysql2
4. Implement proper password hashing using bcrypt
5. Set up JWT for authentication

### Frontend Modifications

Update the frontend code to fetch data from your API endpoints instead of using mock data.

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/9659ae2a-ed91-4a12-b562-b5eae4a1835c) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```
