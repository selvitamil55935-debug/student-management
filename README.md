# Student Management System

A production-grade, full-stack CRUD (Create, Read, Update, Delete) Student Management System web application developed with **React**, a **TypeScript REST API backend**, and a persistent **SQLite 3 database**.

---

## Table of Contents

- [Project Overview](#project-overview)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Database Schema](#database-schema)
- [REST API Endpoints](#rest-api-endpoints)
- [Validation Rules](#validation-rules)
- [API Testing & SOP Test Suite](#api-testing--sop-test-suite)
- [Installation & Setup](#installation--setup)
- [Project Structure](#project-structure)
- [License](#license)

---

## Project Overview

Managing student records manually often leads to duplicate entries, data inconsistencies, and slow retrieval. This computerized Student Management System provides an intuitive, responsive interface for maintaining student data permanently in an SQLite database with end-to-end REST API communication.

---

## System Architecture

The application implements a decoupled client-server architecture communicating entirely over JSON:

```text
┌─────────────────────────────────────────────────────────────┐
│                      React 19 Frontend                      │
│   (Form Validation, Real-Time Search, Table & Modal Views)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                      HTTP JSON Requests
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                    Express REST API Layer                   │
│   (Route Handlers, Server-Side Validation, Business Logic)  │
└──────────────────────────────┬──────────────────────────────┘
                               │
                       SQL Queries (ORM/Driver)
                               │
┌──────────────────────────────▼──────────────────────────────┐
│                      SQLite 3 Database                      │
│                    (File: db.sqlite3)                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

- **Create Student**: Add new student records with immediate client and server-side validation.
- **Read Students**: Browse all students in a responsive table, sorted and filtered dynamically.
- **View Details**: Inspect individual student profile cards with formatted attributes and raw JSON payloads.
- **Update Student**: Inline edit mode allowing seamless updates to existing student information.
- **Delete Student**: Delete records with an accessible confirmation dialog to prevent accidental data loss.
- **Live Search**: Instant multi-attribute search across Name, Email, Course, Phone, and Student ID.
- **Course Filters & Sorting**: Filter by academic department and sort by ID, Name, or Age.
- **Built-in Postman API Console**: Interactive in-app test suite executing all 8 standard test cases live with visual Pass/Fail indicators, response latency, and JSON payload inspection.
- **Architecture & ER Viewer**: Built-in modal demonstrating system design and database relationships.
- **Demo Reset**: Single-click restoration of sample student records for rapid demonstration and grading.

---

## Technology Stack

| Layer | Technology | Description |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript | Component-based interactive UI |
| **Styling** | Tailwind CSS v4 | Responsive, accessible modern design |
| **Icons** | Lucide React | Clean, scalable UI icons |
| **Backend** | Express 4, Node.js | REST API routing and request handling |
| **Runtime & Bundler** | Vite 6, tsx, esbuild | Hot development server and production bundler |
| **Database** | SQLite 3 (`sql.js`) | Relational persistence saved to `db.sqlite3` |
| **API Format** | RESTful JSON | Standardized HTTP methods (GET, POST, PUT, DELETE) |

---

## Database Schema

The database maintains a dedicated `students` table within `db.sqlite3`:

```sql
CREATE TABLE IF NOT EXISTS students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT NOT NULL,
  course TEXT NOT NULL,
  age INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```

### Entity Fields

| Field | Data Type | Constraint | Description |
| :--- | :--- | :--- | :--- |
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | Unique identifier assigned automatically |
| `name` | `TEXT` | `NOT NULL` | Full name of the student (minimum 2 characters) |
| `email` | `TEXT` | `UNIQUE NOT NULL` | Verified student email (unique in database) |
| `phone` | `TEXT` | `NOT NULL` | Contact number (7–15 digits) |
| `course` | `TEXT` | `NOT NULL` | Enrolled degree or department |
| `age` | `INTEGER` | `NOT NULL` | Valid student age between 10 and 100 |
| `created_at`| `DATETIME`| `DEFAULT CURRENT_TIMESTAMP`| Timestamp when the record was registered |

---

## REST API Endpoints

All endpoints use JSON payloads for request bodies and responses:

| Operation | HTTP Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- | :--- |
| **Create Student** | `POST` | `/api/students/` | Adds a new student record | `201 Created` |
| **Read All** | `GET` | `/api/students/` | Retrieves all students (supports `?search=`) | `200 OK` |
| **Read One** | `GET` | `/api/students/:id/` | Retrieves a single student by ID | `200 OK` / `404 Not Found` |
| **Update Student** | `PUT` | `/api/students/:id/` | Updates an existing student record | `200 OK` / `404 Not Found` |
| **Delete Student** | `DELETE` | `/api/students/:id/` | Deletes a student from the database | `200 OK` / `404 Not Found` |
| **System Stats** | `GET` | `/api/stats` | Summary statistics (counts, courses, avg age) | `200 OK` |
| **Reset Demo** | `POST` | `/api/reset-demo` | Resets database to sample student records | `200 OK` |
| **Health Check** | `GET` | `/api/health` | Verifies API and database connectivity | `200 OK` |

---

## Validation Rules

Validation is enforced on both the client (React form) and the server (API controller):

1. **Name**:
   - Must not be empty.
   - Must contain at least 2 characters.
2. **Email**:
   - Must follow valid email format (e.g., `user@domain.com`).
   - Must be unique; duplicate emails return HTTP `400 Bad Request`.
3. **Phone**:
   - Must contain valid numeric digits (between 7 and 15 digits).
4. **Course**:
   - Must not be empty.
5. **Age**:
   - Must be a valid positive integer between `10` and `100`.

---

## API Testing & SOP Test Suite

The application includes an in-app **API Testing Console** allowing evaluation of the 8 required test cases directly against the running SQLite database:

| # | Test Name | Method | Endpoint | Expected Result |
| :---: | :--- | :---: | :--- | :--- |
| **1** | Add Student | `POST` | `/api/students/` | `201 Created` & student object returned |
| **2** | Get All Students | `GET` | `/api/students/` | `200 OK` & array of student records |
| **3** | Get Student by ID | `GET` | `/api/students/1/` | `200 OK` & student record for ID 1 |
| **4** | Update Student | `PUT` | `/api/students/1/` | `200 OK` & updated student record |
| **5** | Empty Required Field | `POST` | `/api/students/` | `400 Bad Request` with "Name is required" |
| **6** | Invalid Email Format | `POST` | `/api/students/` | `400 Bad Request` rejecting invalid email |
| **7** | Duplicate Email | `POST` | `/api/students/` | `400 Bad Request` rejecting existing email |
| **8** | Delete Student | `DELETE`| `/api/students/:id/`| `200 OK` confirming deletion |

---

## Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) version 18 or later
- npm or bun package manager

### 1. Clone or Open the Repository

```bash
cd student-management-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Run Development Server

```bash
npm run dev
```

The application will start on port `3000`. Open `http://localhost:3000` in your web browser.

### 4. Build for Production

```bash
npm run build
```

This compiles the React frontend with Vite and bundles the Express backend server into `dist/server.cjs` using esbuild.

### 5. Start Production Server

```bash
npm start
```

---

## Project Structure

```text
├── index.html                  # HTML entry point
├── package.json                # Project dependencies and scripts
├── server.ts                   # Express server entry point & REST API endpoints
├── db.sqlite3                  # Persistent SQLite database file
├── metadata.json               # Application metadata configuration
├── tsconfig.json               # TypeScript compiler configuration
├── vite.config.ts              # Vite & Tailwind build configuration
├── src/
│   ├── main.tsx                # React application entry point
│   ├── App.tsx                 # Root application component & layout state
│   ├── index.css               # Global styles & Tailwind CSS imports
│   ├── types.ts                # Shared TypeScript interfaces & types
│   ├── api/
│   │   └── client.ts           # Typed REST API client methods
│   ├── components/
│   │   ├── Header.tsx              # Application header, stats, and mode switcher
│   │   ├── StudentForm.tsx         # Add/Edit form with inline validation
│   │   ├── StudentList.tsx         # Searchable, filterable student data table
│   │   ├── StudentDetailModal.tsx  # View student profile & JSON inspector
│   │   ├── DeleteConfirmModal.tsx  # Safe deletion confirmation modal
│   │   ├── ApiTestRunner.tsx       # Postman-equivalent live API test suite
│   │   └── ArchitectureModal.tsx   # System architecture & ER diagram viewer
│   └── server/
│       └── db.ts               # SQLite database manager & initialization
└── README.md                   # Project documentation
```

---

## License

This project is licensed under the Apache-2.0 License.
