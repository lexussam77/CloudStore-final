# CloudStore Backend

This is the backend for the CloudStore Dropbox-like app, built with Spring Boot, PostgreSQL, JWT authentication, and Google OAuth2 login.

## Features
- User registration, login (email/password & Google)
- JWT authentication (with email verification)
- File upload, download, delete, rename, favourite
- Folder management
- Notifications
- PostgreSQL database
- Email verification and password reset

## Setup

### 1. Prerequisites
- Java 17+
- Maven
- PostgreSQL

### 2. Database
Create a PostgreSQL database and user:
```sql
CREATE DATABASE cloudstore;
CREATE USER cloudstore_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE cloudstore TO cloudstore_user;
```

### 3. Configure Application
Edit `src/main/resources/application.properties` with your database, JWT, mail, and Google OAuth credentials.

### 4. Build & Run
```bash
cd backend
mvn spring-boot:run
```

The backend will start on `http://localhost:8080`.

## API
All endpoints are under `/api`. See the frontend for usage examples.

--- 