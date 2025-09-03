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

## Trip Management Endpoints

### GET /trip/get-trips

**Description**: Retrieves a list of all scheduled trips.
**Access**: Public
**Response**:
Status(200)
```json
[
  {
    "trip_id": "c7e89484-9808-433b-abcb-32bc5a01c577",
    "route_id": "some-route-id",
    "departure": "2025-09-03T10:00:00.000Z",
    "arrival": "2025-09-03T14:00:00.000Z",
    "busIds": ["bus-id-1", "bus-id-2"]
  }
]
```

### POST /trip/add-trip

**Description**: Add a new trip schedule.
**Access**: Admin
**Request Body**:
```json
{
  "routeId": "64f990b12a5e1c1a2a6d8f03",
  "departureDate": "2025-09-10",
  "departureTime": "09:00",
  "arrivalTime": "13:00",
  "busIds": ["64f98d1b2a5e1c1a2a6d8f01"]
}
```
**Response**:
Status(200)
```json
{
  "message": "Trip added successfully!"
}
```
Status(400)
```json
{
  "message": "A trip is already scheduled at the same time for one of the buses!"
}
```

## Seat Management Endpoints

### GET /seat/get-bus-seats/:busId

**Description**: Get all seats for a specific bus, including their status.
**Access**: Public
**Parameters**:
- `busId`: The ID of the bus.
**Response**:
Status(200)
```json
{
  "bus": "bus-id-123",
  "seats": [
    {
      "seat_id": "seat-1",
      "seat_number": 1,
      "status": "available"
    },
    {
      "seat_id": "seat-2",
      "seat_number": 2,
      "status": "booked"
    }
  ]
}
```

### PUT /seat/check-in

**Description**: Allows a logged-in user to check in and book a seat for an active trip.
**Access**: Protected (User)
**Request Body**:
```json
{
  "seatId": "seat-id-to-book",
  "busId": "bus-id-of-the-trip"
}
```
**Response**:
Status(200)
```json
{
  "booking": { ... },
  "seat": { ... }
}
```
Status(400)
```json
{ "message": "You cannot check in for more seats than you have bookings for this trip." }
```
Status(404)
```json
{ "message": "This bus is not assigned to a trip in the given time window!" }
```

### PUT /seat/cancel-check-in

**Description**: Allows a logged-in user to cancel their check-in for a seat.
**Access**: Protected (User)
**Request Body**:
```json
{
  "seatId": "seat-id-to-cancel",
  "busId": "bus-id-of-the-trip"
}
```
**Response**:
Status(200)
```json
{
  "message": "Check-in cancelled successfully."
}
```

## Route Management Endpoints

### POST /route/add-route

**Description**: Add a new route with its associated stops.
**Access**: Admin
**Request Body**:
```json
{
  "source": "Cairo",
  "destination": "Alexandria",
  "distance": 220.5,
  "estimatedDuration": 180,
  "stops": ["stop-id-1", "stop-id-2"],
  "isActive": true
}
```
**Response**:
Status(200)
```json
{
  "message": "Route added successfully!"
}
```

### GET /route/get-routes

**Description**: Retrieves a list of all available routes.
**Access**: Public
**Response**:
Status(200)
```json
[
    {
        "route_id": "c7e89484-9808-433b-abcb-32bc5a01c577",
        "source": "Cairo",
        "destination": "E-JUST",
        "distance": "333.30",
        "estimated_duration": 33,
        "is_active": true
    }
]
```

### GET /route/get-route-stops/:routeId

**Description**: Get all stops for a specific route.
**Access**: Public
**Parameters**:
- `routeId`: The ID of the route.
**Response**:
Status(200)
```json
{
    "stops": [
        {
            "stop_id": "3c68282f-7da6-4a70-90fe-c6a89cb857c7",
            "position": 1,
            "stop_name": "Dandy Mall",
            ...
        }
    ]
}
```

## Bus Management Endpoints

### POST /bus/add-bus

**Description**: Add a new bus to the system.
**Access**: Admin
**Request Body**:
```json
{
  "plateNumber": "EGY-1234",
  "capacity": 50,
  "features": ["AC", "WiFi"]
}
```
**Response**:
Status(200)
```json
{
  "message": "Bus added successfully!"
}
```

### GET /bus/get-buses

**Description**: Retrieves a list of all buses.
**Access**: Public
**Response**:
Status(200)
```json
[
    {
        "bus_id": "a1b2c3d4-...",
        "plate_number": "EGY-1234",
        "capacity": 50,
        "features": ["AC", "WiFi"]
    }
]
```

### GET /bus/get-available-buses

**Description**: Retrieves buses that are not currently assigned to an active trip.
**Access**: Public
**Response**:
Status(200)
```json
[
    {
        "bus_id": "a1b2c3d4-...",
        "plate_number": "EGY-5678",
        ...
    }
]
```

## Stop Management Endpoints

### POST /stop/add-stop

**Description**: Add a new stop point.
**Access**: Admin
**Request Body**:
```json
{
  "stopName": "Dandy Mall",
  "location": "https://maps.google.com/..."
}
```
**Response**:
Status(200)
```json
{
  "message": "Stop added successfully!"
}
```

### GET /stop/get-stops

**Description**: Retrieves a list of all stops.
**Access**: Public
**Response**:
Status(200)
```json
[
    {
        "stop_id": "3c68282f-7da6-4a70-90fe-c6a89cb857c7",
        "stop_name": "Dandy Mall",
        ...
    }
]
```

## Payment Endpoints

### POST /payment

**Description**: Process bus reservation payment. (Note: This endpoint seems to be a placeholder in the old docs and may need implementation details).
**Access**: Protected
**Request Body**:
```json
{
  "userId": "user_id",
  "busId": "bus_id",
  "amount": 100.00
}
```

## Admin Management Endpoints

### GET /driver-list

**Description**: Get list of drivers.
**Access**: Admin only

### GET /blacklist

**Description**: Get blacklisted users.
**Access**: Admin only

### POST /blacklist

**Description**: Add user to blacklist.
**Access**: Admin only

## Contact and Support

### POST /contact

**Description**: Submit contact form.
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
