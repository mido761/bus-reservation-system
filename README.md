# Bus Reservation System

A full-stack web application for managing bus reservations, built with the MERN stack (MongoDB, Express.js, React, Node.js).

## Features

- User Authentication and Authorization
  - Login/Register functionality
  - Role-based access control (Users, Admins)
  - Session management
  - Password reset functionality
  - Email verification

- Bus Management
  - View available buses
  - Seat selection and reservation
  - Real-time seat availability updates using Pusher
  - Booking management

- Admin Features
  - Driver management
  - Blacklist management
  - Bus route management
  - User management

- User Features
  - Profile management
  - Booking history
  - Contact support
  - Real-time notifications

## Tech Stack

### Backend
- Node.js with Express.js
- MongoDB with Mongoose
- Express Session for authentication
- Bcrypt for password hashing
- Nodemailer for email notifications
- Pusher for real-time updates
- CORS enabled for secure cross-origin requests

### Frontend
- React.js
- Vite as build tool
- React Router for navigation
- Modern UI/UX design
- Real-time updates with Pusher client

## Project Structure

```
├── client/                 # Frontend React application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── App.jsx       # Main application component
│   │   └── main.jsx      # Application entry point
│   └── public/           # Static assets
│
├── server/                # Backend Node.js application
│   ├── controllers/      # Business logic
│   ├── models/          # Database models
│   │   ├── user.js     # User model
│   │   ├── busModel.js # Bus model
│   │   └── ...         # Other models
│   ├── routes/         # API routes
│   └── index.js        # Server entry point
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:
   ```bash
   # Install backend dependencies
   cd server
   npm install

   # Install frontend dependencies
   cd ../client
   npm install
   ```

3. Environment Setup:
   Create a .env file in the server directory with the following variables:
   ```
   MONGO_URI=your_mongodb_connection_string
   SESSION_SECRET=your_session_secret
   PUSHER_APP_ID=your_pusher_app_id
   PUSHER_KEY=your_pusher_key
   PUSHER_SECRET=your_pusher_secret
   PUSHER_CLUSTER=your_pusher_cluster
   ```

4. Start the application:
   ```bash
   # Start backend server (from server directory)
   npm start

   # Start frontend development server (from client directory)
   npm run dev
   ```

## API Endpoints

### Authentication
- POST /api/login - User login
- POST /api/register - User registration
- POST /logout - User logout
- GET /auth - Check authentication status

### Password Reset
- POST /api/forgot-password - Request password reset code
  - Body: `{ "email": "user@example.com" }`
  - Sends verification code to user's email
  - Response: Success message or error

- POST /api/reset-password - Reset password with verification code
  - Body: `{ "email": "user@example.com", "otp": ["1","2","3","4","5","6"], "password": "newPassword" }`
  - Validates OTP and updates password
  - Response: Success message or error

- POST /api/resend-code - Resend verification code
  - Body: `{ "email": "user@example.com" }`
  - Generates and sends new verification code
  - Response: Success message or error

### Bus Management
- GET /buses - Get all buses
- POST /buses - Add new bus (admin only)
- GET /seatselection - Get seat selection
- POST /formselection - Submit booking form

### User Management
- GET /user - Get user profile
- PUT /user - Update user profile
- GET /blacklist - Get blacklisted users (admin only)
- POST /blacklist - Add user to blacklist (admin only)

### Contact
- POST /contact - Submit contact form

## Core Components

### Authorization System
The system implements a robust authorization mechanism:

- **Inner Authorization**
  - Handles admin privilege verification
  - Role-based access control for sensitive operations
  - Used across protected routes and admin features

- **Password Reset Flow**
  - Secure verification code generation
  - Time-limited verification codes (1 hour validity)
  - Email-based code delivery using Nodemailer
  - Secure password update process with bcrypt hashing

### Security Implementation
- Verification codes are 6-digit numbers
- Codes expire after 1 hour
- Passwords are hashed using bcrypt
- Email notifications for security events
- Protected routes with session validation

## Environment Variables

```env
# Add these to your existing .env file
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
```

## Contributing

Please read our contributing guidelines before submitting pull requests.

## License

This project is licensed under the MIT License.

## Configuration Files

### Package Configuration (package.json)
```json
{
  "name": "server",
  "version": "1.0.0",
  "main": "index.js",
  "scripts": {
    "dev": "npm run build --prefix client && nodemon server/index.js",
    "build": "npm install && npm install --prefix client && npm run build --prefix client",
    "start": "node server/index.js",
    "lint": "eslint .",
    "preview": "vite preview"
  }
}
```

Key dependencies:
- **Backend**:
  - `express`: ^4.21.2 - Web application framework
  - `mongoose`: ^8.9.2 - MongoDB object modeling
  - `bcrypt`: ^5.1.1 - Password hashing
  - `nodemailer`: ^6.10.0 - Email functionality
  - `pusher`: ^5.2.0 - Real-time updates

- **Authentication**:
  - `express-session`: ^1.18.1 - Session management
  - `connect-mongo`: ^5.1.0 - MongoDB session store
  - `jsonwebtoken`: ^9.0.2 - JWT authentication

### Package Lock
The `package-lock.json` file ensures consistent dependency installation across environments by locking dependency versions. This file should be committed to version control to maintain consistency across team development.

### Vercel Configuration (vercel.json)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server/index.js",
      "use": "@vercel/node"
    },
    {
      "src": "./package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "client/dist" }
    }
  ],
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "server/index.js"
    }
  ]
}
```

Deployment configuration:
- **Build Settings**:
  - Node.js server build using `@vercel/node`
  - Static frontend build from `client/dist`
  - Automatic build process on deployment

- **Routing**:
  - All requests rewritten to `server/index.js`
  - Enables proper handling of client-side routing
  - Supports API endpoint routing

## Development Scripts

- `npm run dev`: Start development server with hot-reload
- `npm run build`: Build both client and server
- `npm start`: Start production server
- `npm run lint`: Run ESLint for code quality
- `npm run preview`: Preview production build locally
