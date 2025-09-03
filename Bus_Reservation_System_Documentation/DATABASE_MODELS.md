# Database Models Documentation

## Overview
The Bus Reservation System uses MongoDB with Mongoose ODM for data modeling. This document describes the current database models as defined in the `newServer/models` directory.

---

## User Model (`models/user.js`)

### Schema Definition
```javascript
{
  name: { type: String, trim: true },
  phoneNumber: { type: Number },
  email: { type: String, trim: true, lowercase: true },
  password: { type: String },
  gender: { type: String, enum: ["Male", "Female"], default: "Male" },
  role: { type: String, default: "user" },
  verificationCode: { type: String },
  verificationCodeExpires: {
    type: Date,
    default: () => new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiration
  }
}
```

### Field Descriptions
- **name**: User's full name.
- **phoneNumber**: User's phone number.
- **email**: User's email address.
- **password**: Hashed password for the user.
- **gender**: User's gender.
- **role**: User's role in the system (e.g., 'user', 'admin').
- **verificationCode**: Code sent for email verification or password reset.
- **verificationCodeExpires**: Expiration timestamp for the verification code.

---

## Bus Model (`models/bus.js`)

### Schema Definition
```javascript
{
    seatsId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Seat'
    }],
    plateNumber: { type: String, required: true },
    busType: { type: String, default: "microBus" },
    capacity: { type: Number },
    features: { type: Array, default: ["aircondition"] },
    IsActive: { type: Boolean, default: false }
}
```

### Field Descriptions
- **seatsId**: An array of ObjectIds referencing the seats associated with this bus.
- **plateNumber**: The license plate number of the bus.
- **busType**: The type of the bus (e.g., "microBus").
- **capacity**: The total seating capacity of the bus.
- **features**: An array of strings describing the bus's features (e.g., "AC", "WiFi").
- **IsActive**: A boolean indicating if the bus is currently in service.

### Relationships
- **One-to-Many** with `Seat` (A bus has many seats).

---

## Seat Model (`models/seats.js`)

### Schema Definition
```javascript
{
    busId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Bus' 
    },
    seatNumber: { type: Number, required: true },
    seatType: { type: String, default: "microbusSeat" },
    isAvalable: { type: Boolean, default: true }
}
```

### Field Descriptions
- **busId**: A reference to the `Bus` this seat belongs to.
- **seatNumber**: The number of the seat.
- **seatType**: The type of the seat.
- **isAvalable**: A boolean indicating if the seat is available.

### Relationships
- **Many-to-One** with `Bus` (Many seats belong to one bus).

---

## Stop Model (`models/stop.js`)

### Schema Definition
```javascript
{
    stopName: { type: String, required: true },
    location: { type: String }
}
```

### Field Descriptions
- **stopName**: The name of the stop (e.g., "Dandy Mall").
- **location**: A string representing the location, could be a URL or coordinates.

---

## Route Model (`models/route.js`)

### Schema Definition
```javascript
{
    source: { type: String, required: true },
    destination: { type: String, required: true },
    distance: { type: Number, required: true },
    estimatedDuration: { type: Number, required: true },
    stops: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Stop'
    }],
    isActive: { type: Boolean, default: true }
}
```

### Field Descriptions
- **source**: The starting point of the route.
- **destination**: The ending point of the route.
- **distance**: The total distance of the route in kilometers.
- **estimatedDuration**: The estimated time to complete the route in minutes.
- **stops**: An array of ObjectIds referencing the `Stop` models along this route.
- **isActive**: A boolean indicating if the route is currently active.

### Relationships
- **Many-to-Many** with `Stop` (A route can have many stops, and a stop can be on many routes).

---

## Trip (Schedule) Model (`models/schedule.js`)

### Schema Definition
```javascript
{
  busIds: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Bus"
  }],
  routeIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Route",
    required: true
  }],
  departure: { type: Date, required: true },
  arrival: { type: Date, required: true },
  avaibleSeats: { type: Number },
  Status: {
    type: String,
    enum: ["accepted", "cancelled", "completed", "pending", "failed"],
    default: "pending",
  }
}
```

### Field Descriptions
- **busIds**: An array of `Bus` ObjectIds assigned to this trip.
- **routeIds**: An array of `Route` ObjectIds for this trip.
- **departure**: The departure date and time.
- **arrival**: The arrival date and time.
- **avaibleSeats**: The number of available seats for this trip.
- **Status**: The current status of the trip.

### Relationships
- **Many-to-Many** with `Bus`.
- **Many-to-Many** with `Route`.

---

## Booking Model (`models/booking.js`)

### Schema Definition
```javascript
{
    scheduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Schedule' },
    passangerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    stopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Stop' },
    seatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Seat' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
    ticketId: { type: mongoose.Schema.Types.ObjectId, ref: 'Ticket' },
    Status: {
        type: String,
        enum: ["accepted", "cancelled", "completed", "pending", 'failed'],
        default: "pending",
    },
    createdAt: { type: Date, default: Date.now }
}
```

### Field Descriptions
- **scheduleId**: Reference to the `Schedule` (trip) for the booking.
- **passangerId**: Reference to the `User` who made the booking.
- **stopId**: Reference to the `Stop` for pickup/dropoff.
- **seatId**: Reference to the `Seat` that was booked.
- **paymentId**: Reference to the `Payment` record.
- **ticketId**: Reference to the generated `Ticket`.
- **Status**: The status of the booking.
- **createdAt**: Timestamp of when the booking was created.

### Relationships
- **Many-to-One** with `Schedule`, `User`, `Stop`, `Seat`, `Payment`, `Ticket`.

---
*Last updated: $(Get-Date)*