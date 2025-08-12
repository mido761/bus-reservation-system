# API Endpoints Documentation

## Base URL

```
http://localhost:5000
```

## Authentication Endpoints

### POST /api/auth/login

**Description**: Authenticate user and create session
**Access**: Public
**Request Body**:

```json
{
  "email": "user@example.com",
  "password": "userPassword"
}
```

**Response**:

```json
{
  "message": "Login successful"
}
```

**Status Codes**:

- 200: Success
- 401: Invalid credentials
- 404: User not found
- 500: Server error

### POST /api/auth/logout

**Description**: End user session and clear cookies
**Access**: Protected (requires authentication)
**Response**:

```json
{
  "message": "logout successfuly"
}
```

### GET /auth

**Description**: Check general authentication status
**Access**: Public
**Response**:

```json
{
  "authenticated": true,
  "userId": "user_id",
  "userRole": "admin|user",
  "busId": "bus_id"
}
```

### GET /auth/:busId

**Description**: Verify authentication for specific bus access
**Access**: Protected
**Parameters**:

- `busId`: Bus ID to verify access
  **Response**:

```json
{
  "authenticated": true,
  "busId": "bus_id"
}
```

## User Registration Endpoints

### POST /api/register

**Description**: Register new user with email verification
**Access**: Public
**Request Body**:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "password": "userPassword",
  "phoneNumber": "1234567890",
  "role": "user"
}
```

## Password Reset Endpoints

### POST /api/forgot-password

**Description**: Request password reset code
**Access**: Public
**Request Body**:

```json
{
  "email": "user@example.com"
}
```

**Response**:

```json
{
  "message": "Verification code sent to your email"
}
```

### POST /api/reset-password

**Description**: Reset password with verification code
**Access**: Public
**Request Body**:

```json
{
  "email": "user@example.com",
  "otp": ["1", "2", "3", "4", "5", "6"],
  "password": "newPassword"
}
```

### POST /api/resend-code

**Description**: Resend verification code
**Access**: Public
**Request Body**:

```json
{
  "email": "user@example.com"
}
```

## User Management Endpoints

### GET /user

**Description**: Get all users in the system
**Access**: Admin only
**Response**:

```json
[
  {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "user",
    "bookedBuses": []
  }
]
```

### GET /user/profile/:userId

**Description**: Get specific user's profile
**Access**: Public
**Parameters**:

- `userId`: User ID to fetch
  **Response**:

```json
{
  "_id": "user_id",
  "name": "User Name",
  "email": "user@example.com",
  "phoneNumber": "1234567890",
  "bookedBuses": []
}
```

### POST /user/profilesNames

**Description**: Get names of multiple users by their IDs
**Access**: Public
**Request Body**:

```json
{
  "userIds": ["user_id_1", "user_id_2"]
}
```

### GET /user/form-based-bus/:id

**Description**: Get all buses booked by a specific user (form-based)
**Access**: Public
**Parameters**:

- `id`: User ID

### PUT /user/check-in/:userId

**Description**: Mark a user as checked in
**Access**: Public
**Parameters**:

- `userId`: User ID to check in
  **Response**:

```json
{
  "message": "User checked in successfully",
  "user": { ... }
}
```

### PUT /user/check-out/:userId

**Description**: Mark a user as checked out
**Access**: Public
**Parameters**:

- `userId`: User ID to check out

### PUT /user/edit-gender/:userId

**Description**: Update a user's gender
**Access**: Public
**Parameters**:

- `userId`: User ID to update
  **Request Body**:

```json
{
  "gender": "male|female|other"
}
```

## Booking Management Endpoints

### GET /bookingHistory/user/:id

**Description**: Get booking history for specific user
**Access**: Public
**Parameters**:

- `id`: User ID
  **Response**:

```json
{
  "message": "Booking history successfully found!",
  "bookingHistory": [...]
}
```

### POST /bookingHistory/admin

**Description**: Search booking history by schedule (Admin)
**Access**: Admin
**Request Body**:

```json
{
  "schedule": "2023-12-25"
}
```

###

## Schedule

### POST /schedule/add-schedule

**Description** : Add a new schedule with connected buses and its route
**Access**: Admin
**Request Body**:

```json
{
  {
    "busIds": ["64f98d1b2a5e1c1a2a6d8f01", "64f98d1b2a5e1c1a2a6d8f02"],
    "routeIds": ["64f990b12a5e1c1a2a6d8f03"],
    "departureDate": "2025-08-12",
    "departureTime": "08:30",
    "arrivalTime": "12:45"
  }
}
```

**Response Body**:
Status(200)

```json
{
  "message": "Schedule added successfully!"
}
```

Status(400)

```json
{
  "message": "A trip is already scheduled at the same time!"
}
```

## Route

### POST /route/add-route

**Description** : Add a new route with the exisited Stops
**Access**: Admin
**Request Body**:

```json
{
  "source": "cairo",
  "destination": "ejust",
  "distance": 333.3,
  "estimatedDuration": 33,
  "stops": ["6899b26657d09aa1f4f7b7b2", "6899b24157d09aa1f4f7b7ae"],
  "isActive": true
}
```

**Response Body**:
Status(200)

```json
{
  "message": "Route added successfully!"
}
```

## Bus

### POST /bus/add-buses

**Description** : Add a new bus with the seats that are connected to it in the array seats
**Access**: Admin
**Request Body**:

```json
{
  "blateNumber": "12345gjkl",
  "capacity": 12,
  "features": ["no"]
}
```

**Response Body**:
Status(200)

```json
{
  "message": "bus added successfully!"
}
```

## Stops

### POST /stop/add-stop

**Description** : Add a new stop
**Access**: Admin
**Request Body**:

```json
{
  "stopName": "Dandy",
  "location": "https://share.google/dEA3PwzHeUtzUO3Po"
}
```

**Response Body**:
Status(200)

```json
{
  "message": "bus added successfully!"
}
```

## Bus and Seat Management

### GET /form

**Description**: Get bus forms
**Access**: Protected

### POST /formselection

**Description**: Submit booking form
**Access**: Protected

### GET /seats

**Description**: Get seat information
**Access**: Protected

### POST /payment

**Description**: Process bus reservation payment
**Access**: Protected
**Request Body**:

```json
{
  "userId": "user_id",
  "busId": "bus_id"
}
```

## Admin Management Endpoints

### GET /driver-list

**Description**: Get list of drivers
**Access**: Admin only

### GET /blacklist

**Description**: Get blacklisted users
**Access**: Admin only

### POST /blacklist

**Description**: Add user to blacklist
**Access**: Admin only

## Contact and Support

### POST /contact

**Description**: Submit contact form
**Access**: Protected
**Request Body**:

```json
{
  "name": "User Name",
  "email": "user@example.com",
  "subject": "Support Request",
  "message": "Message content"
}
```

## Real-time Notifications

### POST /notifications

**Description**: Send real-time notifications via Pusher
**Access**: Public
**Request Body**:

```json
{
  "message": "Notification message",
  "recepient": "target_user_id"
}
```

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request

```json
{
  "message": "Invalid request data",
  "error": "Detailed error message"
}
```

### 401 Unauthorized

```json
{
  "message": "unauthenticated: Please log in"
}
```

### 403 Forbidden

```json
{
  "message": "Unauthorized, Access denied"
}
```

### 404 Not Found

```json
{
  "message": "Resource not found"
}
```

### 500 Internal Server Error

```json
{
  "message": "Internal server error",
  "error": "Detailed error message"
}
```

## Request Headers

For protected endpoints, include session cookies automatically handled by the browser. No additional headers required for authentication as the system uses session-based authentication.

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use, especially for:

- Password reset endpoints
- Registration endpoints
- Login attempts

---

_Last updated: $(Get-Date)_
