# Bus Reservation System - Backend Documentation

## Overview
The Bus Reservation System backend is built with Node.js and Express.js, providing a robust API for managing bus reservations, user authentication, and real-time updates. This documentation covers the complete backend architecture, API endpoints, database models, and deployment instructions.

## Table of Contents
1. [Project Structure](#project-structure)
2. [Technology Stack](#technology-stack)
3. [Setup and Installation](#setup-and-installation)
4. [Environment Configuration](#environment-configuration)
5. [API Documentation](#api-documentation)
6. [Database Models](#database-models)
7. [Authentication & Authorization](#authentication--authorization)
8. [Real-time Features](#real-time-features)
9. [Security Features](#security-features)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

## Project Structure
```
server/
├── controllers/          # Business logic controllers
│   ├── authentication/   # Auth-related controllers
│   ├── forgotPasswordController.js
│   ├── middleware.js     # Authentication middleware
│   └── userController.js # User management logic
├── models/              # Database models (Mongoose schemas)
│   ├── user.js         # User model
│   ├── busModel.js     # Bus model
│   └── bookingHistory.js # Booking history model
├── routes/             # API route definitions
│   ├── authRouter.js   # Authentication routes
│   ├── userRoutes.js   # User management routes
│   ├── forgotPasswordRouter.js
│   ├── registerRouter.js
│   ├── bookingHistory.js
│   ├── seats.js        # Seat management
│   ├── contactRoutes.js
│   ├── blackList.js    # User blacklist management
│   ├── driverList.js   # Driver management
│   ├── formRouter.js   # Form-based bookings
│   └── formBookingRouter.js
├── utils/              # Utility functions
│   ├── session.js      # Session management
│   └── nodeMailer.js   # Email service
└── index.js           # Main server file
```

## Technology Stack

### Core Technologies
- **Node.js**: Runtime environment
- **Express.js**: Web application framework
- **MongoDB**: Database (with Mongoose ODM)
- **Express Session**: Session management
- **bcrypt**: Password hashing

### Additional Services
- **Pusher**: Real-time communication
- **Nodemailer**: Email notifications
- **CORS**: Cross-origin resource sharing
- **dotenv**: Environment variable management

## Setup and Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- Git

### Installation Steps
1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create environment configuration file
4. Start the server:
   ```bash
   npm start          # Production
   npm run dev        # Development with nodemon
   ```

## Environment Configuration

Create a `.env` file in the root directory with the following variables:

```env
# Database Configuration
MONGO_URI=mongodb://localhost:27017/bus_reservation_system

# Session Configuration
SESSION_SECRET=your_secure_session_secret_here

# Pusher Configuration (Real-time features)
PUSHER_APP_ID=your_pusher_app_id
PUSHER_KEY=your_pusher_key
PUSHER_SECRET=your_pusher_secret
PUSHER_CLUSTER=your_pusher_cluster

# Email Configuration
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password

# Server Configuration
PORT=5000
NODE_ENV=development
BACK_END_URL=http://localhost:5000
```

### Environment Variables Explained
- `MONGO_URI`: MongoDB connection string
- `SESSION_SECRET`: Secret key for session encryption
- `PUSHER_*`: Pusher service credentials for real-time updates
- `EMAIL_*`: Gmail credentials for sending notifications
- `NODE_ENV`: Environment mode (development/production)

## API Documentation
See [API_ENDPOINTS.md](./API_ENDPOINTS.md) for complete API documentation.

## Database Models
See [DATABASE_MODELS.md](./DATABASE_MODELS.md) for detailed model schemas.

## Authentication & Authorization
See [AUTHENTICATION.md](./AUTHENTICATION.md) for security implementation details.

## Real-time Features
The system uses Pusher for real-time updates including:
- Seat availability updates
- Booking notifications
- System alerts

## Security Features
- Password hashing with bcrypt
- Session-based authentication
- Role-based access control
- CORS protection
- Input validation
- Environment variable security

## Deployment
See [DEPLOYMENT.md](./DEPLOYMENT.md) for deployment instructions.

## Troubleshooting
See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

---
*Last updated: $(Get-Date)*