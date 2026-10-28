# CareerBoard — Job Application Tracker

A full-stack portfolio project for managing job applications. The frontend is built with React and Vite, the backend uses Java 21 and Spring Boot, and MySQL stores the application records.

## Features

- Dashboard cards for total applications, applied roles, interviews, and offers
- Create, view, edit, and delete job applications
- Search by company, role, or notes
- Filter by application status
- Store company, role, job URL, status, applied date, notes, and creation timestamp
- Input validation and API error handling
- Responsive interface for desktop and mobile
- REST API tested separately with Postman

## Tech stack

- Frontend: React, Vite, JavaScript, CSS, Lucide icons
- Backend: Java 21, Spring Boot, REST, JDBC, Maven
- Database: MySQL
- API testing: Postman

## Project layout

```text
jobtracker/
├── frontend/                  # React web application
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── styles.css
│   ├── package.json
│   ├── vite.config.js
│   └── index.html
├── src/main/java/              # Spring Boot API
├── src/main/resources/
│   ├── application.properties
│   └── schema.sql
├── src/test/                   # Backend tests
├── pom.xml
├── mvnw.cmd
└── README.md
```

## Requirements

- Java 21
- Node.js LTS (includes npm)
- MySQL Server
- A MySQL database named `jobtracker`
- VS Code or another code editor

## 1. Configure MySQL

Start the MySQL service and create the database. In MySQL Workbench, open a SQL tab and run:

```sql
CREATE DATABASE IF NOT EXISTS jobtracker;
```

The backend defaults to:

- URL: `jdbc:mysql://localhost:3306/jobtracker`
- Username: `root`
- Password: empty by default

**Do not commit your actual database password.** If your MySQL root account has a password, set it in the terminal before starting Spring Boot.

PowerShell example (replace the placeholder with your local password):

```powershell
$env:MYSQL_USERNAME = "root"
$env:MYSQL_PASSWORD = "YOUR_LOCAL_MYSQL_PASSWORD"
```

These variables apply to the current PowerShell terminal only.

## 2. Start the backend

Open a terminal in the project root (`jobtracker`).

```powershell
.\mvnw.cmd test
.\mvnw.cmd spring-boot:run
```

Keep this terminal running. The API should be available at `http://localhost:8080`.

If `mvnw.cmd` is blocked by Windows, use:

```powershell
.\mvnw.cmd spring-boot:run
```

## 3. Start the frontend

Install Node.js LTS if `node` and `npm` are not available. Open a **second** terminal in VS Code:

```powershell
cd frontend
npm install
npm run dev
```

Open the local address printed by Vite, normally `http://localhost:5173`.

The frontend calls `http://localhost:8080/api/applications` by default. To use a different API address, copy `frontend/.env.example` to `frontend/.env` and edit `VITE_API_URL`.

## 4. API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/applications` | List all applications |
| GET | `/api/applications/{id}` | Get one application |
| POST | `/api/applications` | Create an application |
| PUT | `/api/applications/{id}` | Update an application |
| DELETE | `/api/applications/{id}` | Delete an application |

Example JSON body:

```json
{
  "company": "Google",
  "role": "Software Engineer",
  "jobUrl": "https://careers.google.com/",
  "status": "APPLIED",
  "appliedDate": "2026-10-28",
  "notes": "First test application"
}
```

Supported status values in the UI: `APPLIED`, `INTERVIEW`, `OFFER`, `REJECTED`.

## Troubleshooting

- **Frontend says it cannot connect:** confirm the Spring Boot terminal is running and MySQL is available.
- **Database access denied:** verify `MYSQL_USERNAME` and `MYSQL_PASSWORD`.
- **Database does not exist:** run the `CREATE DATABASE` SQL above.
- **Port 8080 is busy:** stop the other application using that port before starting Spring Boot.
- **Port 5173 is busy:** stop the other Vite process.
- **`npm` is not recognized:** install Node.js LTS, reopen VS Code, and run `node -v` and `npm -v`.

## GitHub checklist

Before publishing:
- Never commit database passwords, `.env` files, `node_modules`, or `target`.
- Add screenshots of the running application to the README.
- Include setup instructions and note any known limitations.
- Test from a clean checkout if possible.

## Current scope

This is a local-development portfolio project. It does not yet include user accounts/authentication, cloud deployment, or production secrets management.
