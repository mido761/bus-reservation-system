# Authentication & Authorization Documentation

## Overview
The Bus Reservation System uses a robust, session-based authentication system with role-based access control (RBAC) to secure the application. This document details the authentication flow, security measures, and authorization logic.

## Authentication Flow

### 1. User Registration (`/register`)
1.  A user submits their registration details (name, email, password).
2.  The system hashes the password using `bcrypt`.
3.  A new user record is created in the `users` table in the PostgreSQL database.
4.  A verification code is generated and sent to the user's email via `nodemailer`.
5.  The user must verify their email to activate their account.

### 2. Login Process (`/auth/login`)
1.  A user submits their email and password.
2.  The system retrieves the user from the database by email.
3.  It securely compares the submitted password with the stored hash using `bcrypt.compare()`.
4.  If the password is valid, a new session is created.
5.  The `user_id` and `role` are stored in the server-side session.
6.  A session cookie is sent back to the client to be included in subsequent requests.

### 3. Session Management
- **Technology**: `express-session` is used to manage sessions.
- **Storage**: Sessions are stored in a dedicated table in the PostgreSQL database using `connect-pg-simple`. This ensures that sessions persist even if the server restarts.
- **Session Cookie**: The client receives a cookie containing the session ID. This cookie is configured to be `httpOnly` to prevent access from client-side scripts (mitigating XSS attacks) and is sent with every subsequent request to authenticated endpoints.

## Authorization System

### Middleware (`middleware/authentication.js`)

Authorization is enforced using custom middleware that checks the user's session and role.

#### `isAuthenticated` Middleware
- **Purpose**: Ensures that a user is logged in before they can access a protected route.
- **Logic**: It checks if `req.session.userId` exists. If not, it returns a `401 Unauthorized` error.

#### `isAdmin` Middleware
- **Purpose**: Restricts access to admin-only routes.
- **Logic**: It first checks if the user is authenticated, then verifies that `req.session.userRole` is equal to `'admin'`. If not, it returns a `403 Forbidden` error.

### Role-Based Access Control (RBAC)

The system defines two primary roles:
1.  **`user`**: Standard customer role.
    - Can book seats, view their booking history, and manage their profile.
2.  **`admin`**: Administrator role.
    - Has all `user` permissions.
    - Can manage trips, routes, buses, stops, and view all user data.

### Protected Routes (`routers/`)

Middleware is applied at the router level to protect entire feature sets.

```javascript
// Example: Protecting user routes
import { isAuthenticated } from '../middleware/authentication.js';
router.get('/profile', isAuthenticated, userController.getProfile);

// Example: Protecting admin routes
import { isAdmin } from '../middleware/authentication.js';
router.post('/add-trip', isAdmin, tripController.addTrip);
```

## Password Security

- **Hashing Algorithm**: `bcrypt` is used to hash all user passwords before they are stored in the database. A salt is automatically generated and included in the hash.
- **Password Comparison**: `bcrypt.compare()` is used to safely compare a plaintext password with a hash without ever exposing the original password.

```javascript
// Hashing a new password
const saltRounds = 10;
const hashedPassword = await bcrypt.hash(password, saltRounds);

// Verifying a password during login
const match = await bcrypt.compare(password, user.password_hash);
```

## Password Reset System

1.  **Request (`/forgot-password`)**: A user requests a password reset for their email.
2.  **Code Generation**: A secure, random verification code is generated.
3.  **Email Delivery**: The code is sent to the user's email using `nodemailer`. The code is stored in the database with an expiration timestamp.
4.  **Reset (`/reset-password`)**: The user submits the verification code, their email, and a new password.
5.  **Verification**: The system checks if the code is valid and has not expired.
6.  **Update**: If valid, the user's password is updated with the new hashed password.

## CORS Configuration

Cross-Origin Resource Sharing (CORS) is configured to enhance security by restricting which domains can access the API.

```javascript
// In index.js
import cors from 'cors';

const allowedOrigins = [
  'http://localhost:5173', // Frontend development server
  process.env.FRONT_END_URL // Production frontend URL
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true // Allows cookies to be sent
}));
```

This setup ensures that only the official frontend application can make requests to the backend API, preventing unauthorized access from other websites.

---
*Last updated: $(Get-Date)*