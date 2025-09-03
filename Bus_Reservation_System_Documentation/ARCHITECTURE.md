# System Architecture Documentation

## Overview
The Bus Reservation System follows a modular, layered architecture. This document outlines the current system architecture for both the backend (`newServer`) and frontend (`client`), data flow, and key design patterns.

## High-Level Architecture

```
┌─────────────────┐      ┌─────────────────┐      ┌─────────────────┐
│   Client Tier   │      │ Application     │      │   Data Tier     │
│  (Frontend)     │◄───► │ Tier (Backend)  │◄───► │   (Database)    │
│                 │      │                 │      │                 │
│ - React.js      │      │ - Node.js       │      │ - PostgreSQL    │
│ - Vite          │      │ - Express.js    │      │ - pg (node-pg)  │
│ - Axios         │      │ - Session Mgmt  │      │ - Session Store │
└─────────────────┘      └─────────────────┘      └─────────────────┘
```

## Backend Architecture (`newServer`)

### 1. Application Structure (Layered Pattern)

The `newServer` directory follows a feature-based layered architecture, which improves modularity and separation of concerns.

```
newServer/
├── index.js                 # Application entry point
├── db.js                    # Database connection setup (PostgreSQL)
├── controllers/             # Business Logic Layer
│   ├── userController.js    # Handles user-related logic
│   ├── tripController.js    # Manages trips and scheduling
│   ├── seatController.js    # Handles seat status and check-in
│   └── ...                  # Other controllers for each feature
├── middleware/              # Cross-cutting concerns
│   └── authentication.js    # Session and role-based auth
├── models/                  # Data Access Layer (interacts with DB)
│   ├── user.js              # User data operations
│   ├── trip.js              # Trip data operations
│   └── ...                  # Other models for each DB table
├── routers/                 # API Layer (Endpoints)
│   ├── authRouter.js        # Authentication endpoints
│   ├── tripRouter.js        # Trip-related endpoints
│   └── ...                  # Other routers for each feature
└── utils/                   # Shared utility functions
    ├── nodeMailer.js        # Email sending service
    └── session.js           # Session configuration
```

### 2. Request Flow Architecture

A typical request to the backend follows these steps:

1.  **Client Request**: An HTTP request is sent from the frontend to a specific endpoint.
2.  **Express Router (`routers/`)**: The router matches the request path to a controller function.
3.  **Middleware (`middleware/`)**: The request passes through middleware for authentication, session handling, and input validation.
4.  **Controller (`controllers/`)**: The controller executes the core business logic, calling model functions to interact with the database.
5.  **Model (`models/`)**: The model function executes the corresponding SQL query against the PostgreSQL database.
6.  **Response**: The controller sends back an HTTP response (e.g., JSON data or an error message) to the client.

### 3. Key Architectural Patterns
- **Layered Architecture**: Separates concerns into API (routers), business logic (controllers), and data access (models).
- **Dependency Injection**: The database client (`pool`) is imported and used in controllers, decoupling them from the direct database connection setup.
- **Asynchronous Operations**: Extensive use of `async/await` for non-blocking database I/O.

## Frontend Architecture (`client`)

### 1. Application Structure

The `client` directory is a modern React application built with Vite.

```
client/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── admin-dashboard/ # Components for the admin panel
│   │   ├── check-in/        # Seat selection and check-in UI
│   │   └── ...
│   ├── App.jsx              # Main application component with routing
│   ├── main.jsx             # Application entry point
│   └── ...
├── vite.config.js           # Vite build configuration
└── package.json             # Project dependencies and scripts
```

### 2. Key Architectural Patterns
- **Component-Based Architecture**: The UI is built from small, reusable React components.
- **Client-Side Routing**: `react-router-dom` is used to handle navigation within the single-page application (SPA).
- **State Management**: Primarily uses React Hooks (`useState`, `useEffect`) for managing component state.
- **API Interaction**: `axios` is used for making HTTP requests to the backend API.

## Data Flow: User Check-in Example

This example illustrates the full data flow for a user checking in for a seat.

1.  **Frontend (`Checkin.jsx`)**:
    - User selects a seat on the bus diagram.
    - An `onClick` handler calls `handleConfirmClick`, which shows a confirmation popup.
    - Upon confirmation, `handlePopupConfirm` sends a `PUT` request to `/api/seat/check-in` with the `seatId` and `busId`.

2.  **Backend (`seatRouter.js`)**:
    - The router maps the `PUT /check-in` request to the `checkInOrCancel` function in `seatController.js`.

3.  **Backend (`seatController.js` & `checkInHelper.js`)**:
    - The controller begins a database transaction (`BEGIN`).
    - It validates that the bus has an active trip (`getActiveTrip`).
    - It verifies the user hasn't exceeded their booking limit (`getBookingCount`, `getCheckedInCount`).
    - It updates the seat's status to "booked" and links the booking to the user (`updateBookingStatus`).
    - If all steps succeed, it commits the transaction (`COMMIT`).
    - If any step fails, it rolls back all changes (`ROLLBACK`).

4.  **Frontend (Optimistic Update)**:
    - After the API call succeeds, the frontend immediately updates the local `seats` state to mark the seat as "booked".
    - This provides instant visual feedback to the user without waiting for a full data refetch.

## Security Architecture

- **Authentication**: Session-based authentication using `express-session` with a server-side session store. Cookies are used to maintain the session.
- **Authorization**: Middleware checks user roles (e.g., `admin`) to protect sensitive endpoints.
- **Password Security**: Passwords are hashed using `bcrypt` before being stored.
- **CORS**: The `cors` middleware is configured to allow requests only from the frontend's origin.

## Scalability and Performance

- **Connection Pooling**: The `pg` library's connection pool is used to efficiently manage database connections.
- **Stateless API**: The backend API is largely stateless, relying on the session store for user state, which allows for horizontal scaling.
- **Frontend Build Optimization**: Vite provides fast development builds and optimized production bundles with code splitting.

---
*Last updated: $(Get-Date)*