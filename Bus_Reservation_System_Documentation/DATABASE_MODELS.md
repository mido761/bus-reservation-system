# Database Models Documentation

## Overview
The Bus Reservation System uses MongoDB with Mongoose ODM for data modeling. This document describes all database models, their schemas, relationships, and usage patterns.

## User Model (`models/user.js`)

### Schema Definition
```javascript
{
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  phoneNumber: {
    type: String,
    required: true,
    unique: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  bookedBuses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus'
  }],
  checkInStatus: {
    type: Boolean,
    default: false
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String
  },
  verificationCodeExpires: {
    type: Date
  },
  resetPasswordCode: {
    type: String
  },
  resetPasswordExpires: {
    type: Date
  }
}
```

### Field Descriptions
- **name**: User's full name (required, trimmed)
- **email**: Unique email address (required, lowercase)
- **password**: Hashed password (required, minimum 6 characters)
- **phoneNumber**: Unique phone number (required)
- **role**: User role - 'user' or 'admin' (default: 'user')
- **bookedBuses**: Array of Bus ObjectIds (references)
- **checkInStatus**: Whether user is currently checked in
- **gender**: User's gender (optional)
- **isVerified**: Email verification status
- **verificationCode**: Email verification code
- **verificationCodeExpires**: Verification code expiration date
- **resetPasswordCode**: Password reset verification code
- **resetPasswordExpires**: Reset code expiration date

### Indexes
- email (unique)
- phoneNumber (unique)

### Relationships
- One-to-Many with Bus (through bookedBuses array)
- One-to-Many with BookingHistory (through user reference)

## Bus Model (`models/busModel.js`)

### Schema Definition
```javascript
{
  busNumber: {
    type: String,
    required: true,
    unique: true
  },
  route: {
    from: {
      type: String,
      required: true
    },
    to: {
      type: String,
      required: true
    }
  },
  schedule: {
    departureTime: {
      type: Date,
      required: true
    },
    arrivalTime: {
      type: Date,
      required: true
    }
  },
  capacity: {
    type: Number,
    required: true,
    min: 1
  },
  availableSeats: {
    type: Number,
    required: true,
    min: 0
  },
  seats: [{
    seatNumber: {
      type: String,
      required: true
    },
    isBooked: {
      type: Boolean,
      default: false
    },
    bookedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    bookedAt: {
      type: Date
    }
  }],
  price: {
    type: Number,
    required: true,
    min: 0
  },
  driver: {
    name: {
      type: String,
      required: true
    },
    licenseNumber: {
      type: String,
      required: true
    },
    phoneNumber: {
      type: String,
      required: true
    }
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  }
}
```

### Field Descriptions
- **busNumber**: Unique bus identifier
- **route**: Origin and destination information
- **schedule**: Departure and arrival times
- **capacity**: Total number of seats
- **availableSeats**: Currently available seats
- **seats**: Array of seat objects with booking information
- **price**: Ticket price
- **driver**: Driver information object
- **status**: Bus trip status

### Indexes
- busNumber (unique)
- route.from + route.to (compound)
- schedule.departureTime

### Relationships
- Many-to-Many with User (through seats.bookedBy)

## Booking History Model (`models/bookingHistory.js`)

### Schema Definition
```javascript
{
  busId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Bus',
    required: true
  },
  bookedBy: {
    Id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    }
  },
  seatsBooked: [{
    seatNumber: {
      type: String,
      required: true
    },
    passengerName: {
      type: String,
      required: true
    },
    passengerAge: {
      type: Number,
      required: true
    },
    passengerGender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true
    }
  }],
  bookingDate: {
    type: Date,
    default: Date.now
  },
  schedule: {
    type: Date,
    required: true
  },
  totalAmount: {
    type: Number,
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  bookingStatus: {
    type: String,
    enum: ['confirmed', 'cancelled', 'completed'],
    default: 'confirmed'
  }
}
```

### Field Descriptions
- **busId**: Reference to the booked bus
- **bookedBy**: User information who made the booking
- **seatsBooked**: Array of booked seats with passenger details
- **bookingDate**: When the booking was made
- **schedule**: Bus departure date
- **totalAmount**: Total payment amount
- **paymentStatus**: Payment processing status
- **bookingStatus**: Booking status

### Indexes
- busId
- bookedBy.Id
- schedule
- bookingDate

### Relationships
- Many-to-One with Bus (through busId)
- Many-to-One with User (through bookedBy.Id)

## Driver Model (Embedded in Bus)

### Schema Definition
```javascript
{
  name: {
    type: String,
    required: true
  },
  licenseNumber: {
    type: String,
    required: true,
    unique: true
  },
  phoneNumber: {
    type: String,
    required: true
  },
  experience: {
    type: Number, // years of experience
    min: 0
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 5
  }
}
```

## Contact Message Model

### Schema Definition
```javascript
{
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  submittedAt: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['new', 'read', 'responded'],
    default: 'new'
  },
  response: {
    type: String
  },
  respondedAt: {
    type: Date
  }
}
```

## Blacklist Model

### Schema Definition
```javascript
{
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reason: {
    type: String,
    required: true
  },
  blacklistedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  blacklistedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
}
```

## Data Relationships

### User ↔ Bus Relationship
- Users can book multiple buses (One-to-Many)
- Buses can have multiple users (Many-to-One)
- Relationship managed through Bus.seats.bookedBy array

### User ↔ BookingHistory Relationship
- Users can have multiple booking records (One-to-Many)
- Each booking belongs to one user (Many-to-One)

### Bus ↔ BookingHistory Relationship
- Buses can have multiple booking records (One-to-Many)
- Each booking is for one bus (Many-to-One)

## Database Operations

### Common Queries

#### Find Available Buses
```javascript
Bus.find({
  'route.from': sourceCity,
  'route.to': destinationCity,
  'schedule.departureTime': { $gte: selectedDate },
  availableSeats: { $gt: 0 },
  status: 'active'
});
```

#### Book a Seat
```javascript
// Update bus seats
Bus.findByIdAndUpdate(busId, {
  $set: {
    'seats.$.isBooked': true,
    'seats.$.bookedBy': userId,
    'seats.$.bookedAt': new Date()
  },
  $inc: { availableSeats: -1 }
});

// Create booking history
BookingHistory.create({
  busId,
  bookedBy: { Id: userId, name, email },
  seatsBooked: [...],
  schedule: busSchedule,
  totalAmount
});
```

#### User Authentication
```javascript
// Find user by email
User.findOne({ email: userEmail });

// Update password reset code
User.findByIdAndUpdate(userId, {
  resetPasswordCode: code,
  resetPasswordExpires: expirationTime
});
```

## Performance Considerations

### Indexing Strategy
1. **User Model**: Index on email and phoneNumber for fast lookups
2. **Bus Model**: Compound index on route and departure time
3. **BookingHistory**: Index on busId, userId, and schedule

### Query Optimization
1. Use projection to limit returned fields
2. Populate references only when necessary
3. Use aggregation pipeline for complex queries
4. Implement pagination for large result sets

### Data Archiving
Consider archiving completed bookings older than 1 year to maintain performance.

---
*Last updated: $(Get-Date)*