# System Architecture Documentation

## Overview
The Bus Reservation System follows a traditional three-tier architecture with a clear separation between presentation, business logic, and data layers. This document outlines the complete system architecture, data flow, and design patterns used.

## High-Level Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Tier   │    │ Application     │    │   Data Tier     │
│  (Frontend)     │◄──►│ Tier (Backend)  │◄──►│   (Database)    │
│                 │    │                 │    │                 │
│ - React.js      │    │ - Node.js       │    │ - MongoDB       │
│ - Vite          │    │ - Express.js    │    │ - Mongoose ODM  │
│ - Real-time UI  │    │ - Session Mgmt  │    │ - Session Store │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                        │                        │
         └────────────────────────┼────────────────────────┘
                                  │
                    ┌─────────────────┐
                    │ External Services│
                    │                 │
                    │ - Pusher (WS)   │
                    │ - Email (SMTP)  │
                    │ - File Storage  │
                    └─────────────────┘
```

## Backend Architecture Details

### 1. Application Structure (MVC Pattern)

```
server/
├── index.js                 # Application entry point
├── controllers/             # Business Logic Layer
│   ├── authentication/      # Auth-specific controllers
│   │   ├── loginController.js
│   │   └── logoutController.js
│   ├── userController.js    # User management logic
│   ├── forgotPasswordController.js
│   └── middleware.js        # Cross-cutting concerns
├── routes/                  # Presentation Layer (API)
│   ├── authRouter.js        # Authentication endpoints
│   ├── userRoutes.js        # User management endpoints
│   ├── bookingHistory.js    # Booking-related endpoints
│   └── ...                  # Other route modules
├── models/                  # Data Access Layer
│   ├── user.js             # User schema & model
│   ├── busModel.js         # Bus schema & model
│   └── bookingHistory.js   # Booking schema & model
└── utils/                  # Utility Layer
    ├── session.js          # Session management utilities
    └── nodeMailer.js       # Email service utilities
```

### 2. Layered Architecture

#### **Presentation Layer (Routes)**
- **Responsibility**: Handle HTTP requests/responses
- **Components**: Express routers, request validation, response formatting
- **Pattern**: RESTful API design

```javascript
// Example: Route handles HTTP concerns only
router.post('/login', loginController);
router.get('/users', middleware.isAuthenticated, getAllUsers);
```

#### **Business Logic Layer (Controllers)**
- **Responsibility**: Application logic, validation, coordination
- **Components**: Controllers, middleware, business rules
- **Pattern**: Service layer pattern

```javascript
// Example: Controller handles business logic
const login = async (req, res) => {
  // 1. Validate input
  // 2. Business logic (authentication)
  // 3. Coordinate with data layer
  // 4. Return appropriate response
};
```

#### **Data Access Layer (Models)**
- **Responsibility**: Data persistence, queries, relationships
- **Components**: Mongoose models, schemas, database operations
- **Pattern**: Active Record pattern (via Mongoose)

```javascript
// Example: Model defines data structure and operations
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true }
});
userSchema.methods.checkPassword = function(password) { /* ... */ };
```

#### **Utility Layer**
- **Responsibility**: Cross-cutting concerns, shared functionality
- **Components**: Session management, email services, helpers
- **Pattern**: Utility/Helper pattern

## Request Flow Architecture

### 1. Typical Request Flow

```
1. Client Request
   │
   ▼
2. Express.js Router
   │
   ▼
3. Middleware Chain
   ├── CORS Middleware
   ├── Session Middleware
   ├── Authentication Middleware
   └── Authorization Middleware
   │
   ▼
4. Route Handler
   │
   ▼
5. Controller Logic
   │
   ▼
6. Model Operations
   │
   ▼
7. Database Query
   │
   ▼
8. Response Formation
   │
   ▼
9. Client Response
```

### 2. Authentication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │ POST /login      │                  │
       ├─────────────────►│                  │
       │                  │ Find user        │
       │                  ├─────────────────►│
       │                  │ User data        │
       │                  │◄─────────────────┤
       │                  │ Verify password  │
       │                  │ Create session   │
       │                  ├─────────────────►│
       │ Session cookie   │                  │
       │◄─────────────────┤                  │
       │                  │                  │
```

### 3. Real-time Communication Flow

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │   Pusher    │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │ Subscribe        │                  │
       ├─────────────────►│                  │
       │                  │ Channel setup    │
       │                  ├─────────────────►│
       │                  │                  │
       │ Booking action   │                  │
       ├─────────────────►│                  │
       │                  │ Process booking  │
       │                  │ Trigger event    │
       │                  ├─────────────────►│
       │                  │                  │
       │ Real-time update │                  │
       │◄─────────────────┼──────────────────┤
       │                  │                  │
```

## Database Architecture

### 1. Data Model Relationships

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│    User     │    │    Bus      │    │ BookingHist │
│             │    │             │    │             │
│ _id         │◄──┐│ _id         │◄──┐│ _id         │
│ name        │   ││ busNumber   │   ││ busId       │
│ email       │   ││ route       │   ││ bookedBy    │
│ password    │   ││ schedule    │   ││ seatsBooked │
│ bookedBuses │───┘│ seats[]     │   ││ totalAmount │
│ role        │    │ ├─bookedBy  │───┘│ bookingDate │
│ ...         │    │ └─isBooked  │    │ ...         │
└─────────────┘    └─────────────┘    └─────────────┘
```

### 2. Collection Design Patterns

#### **User Collection**
- **Pattern**: Single document per user
- **Relationships**: References to booked buses
- **Indexing**: Email, phone number
- **Scaling**: Horizontal scaling friendly

#### **Bus Collection**
- **Pattern**: Embedded seat documents
- **Relationships**: References to users in seats
- **Indexing**: Route, departure time, bus number
- **Trade-offs**: Read optimization over write consistency

#### **Booking History Collection**
- **Pattern**: Event sourcing pattern
- **Relationships**: References to users and buses
- **Indexing**: User ID, bus ID, booking date
- **Purpose**: Audit trail and reporting

## Security Architecture

### 1. Security Layers

```
┌─────────────────────────────────────────────────────┐
│                 Application Security                │
├─────────────────────────────────────────────────────┤
│ • Input Validation    • Authentication              │
│ • Authorization       • Session Management          │
│ • CORS Policy        • Rate Limiting (planned)      │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│                Transport Security                   │
├─────────────────────────────────────────────────────┤
│ • HTTPS/TLS          • Secure Cookies               │
│ • Header Security    • Certificate Validation       │
└─────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────┐
│                  Data Security                      │
├─────────────────────────────────────────────────────┤
│ • Password Hashing   • Environment Variables        │
│ • Database Auth      • Encryption at Rest           │
└─────────────────────────────────────────────────────┘
```

### 2. Authentication & Authorization Architecture

```
┌─────────────────┐
│ Session Store   │
│   (MongoDB)     │
└─────────┬───────┘
          │
          ▼
┌─────────────────┐    ┌─────────────────┐
│ Session Middle- │    │ Auth Middleware │
│ ware (Express)  │◄──►│   Functions     │
└─────────┬───────┘    └─────────────────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│ User Session    │    │ Role-based      │
│ Management      │    │ Access Control  │
└─────────────────┘    └─────────────────┘
```

## Scalability Architecture

### 1. Current Architecture Limitations

**Single Instance Limitations:**
- Single point of failure
- Limited concurrent users
- No load distribution
- Session store centralization

### 2. Horizontal Scaling Strategy

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│Load Balancer│    │   Server    │    │  Database   │
│   (Nginx)   │    │  Instance   │    │   Cluster   │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       ├─────────────────►│ Server 1         │
       │                  │                  │
       ├─────────────────►│ Server 2         │
       │                  │                  │
       ├─────────────────►│ Server 3         │
       │                  │                  │
       │                  └─────────────────►│ MongoDB
       │                                     │ Replica Set
       │                                     │
       │  ┌─────────────┐                   │
       └─►│   CDN       │                   │
          │ (Static)    │                   │
          └─────────────┘                   │
```

### 3. Microservices Evolution Path

**Current Monolith:**
```
┌─────────────────────────────────────┐
│        Single Server Process       │
├─────────────────────────────────────┤
│ • Authentication                    │
│ • User Management                   │
│ • Bus Management                    │
│ • Booking System                    │
│ • Email Service                     │
│ • File Serving                      │
└─────────────────────────────────────┘
```

**Future Microservices:**
```
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    Auth     │ │    User     │ │   Booking   │
│  Service    │ │  Service    │ │  Service    │
└─────────────┘ └─────────────┘ └─────────────┘
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│    Bus      │ │   Email     │ │   Payment   │
│  Service    │ │  Service    │ │  Service    │
└─────────────┘ └─────────────┘ └─────────────┘
```

## Performance Architecture

### 1. Caching Strategy

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │
│   Browser   │    │   Memory    │    │   MongoDB   │
│   Cache     │    │   Cache     │    │             │
└──────┬──────┘    └──────┬──────┘    └──────┬──────┘
       │                  │                  │
       │ 1. Request       │                  │
       ├─────────────────►│                  │
       │                  │ 2. Check cache   │
       │                  │                  │
       │                  │ 3. DB Query      │
       │                  ├─────────────────►│
       │                  │ 4. Data          │
       │                  │◄─────────────────┤
       │                  │ 5. Cache data    │
       │ 6. Response      │                  │
       │◄─────────────────┤                  │
```

### 2. Database Optimization

**Indexing Strategy:**
```javascript
// User collection indexes
db.users.createIndex({ "email": 1 }, { unique: true })
db.users.createIndex({ "phoneNumber": 1 }, { unique: true })

// Bus collection indexes
db.buses.createIndex({ "route.from": 1, "route.to": 1 })
db.buses.createIndex({ "schedule.departureTime": 1 })
db.buses.createIndex({ "status": 1 })

// Booking history indexes
db.bookinghistories.createIndex({ "bookedBy.Id": 1 })
db.bookinghistories.createIndex({ "schedule": 1 })
db.bookinghistories.createIndex({ "bookingDate": 1 })
```

**Query Optimization:**
- Use projections to limit returned fields
- Implement pagination for large datasets
- Use aggregation pipelines for complex queries
- Implement read preferences for replica sets

## Deployment Architecture

### 1. Development Environment

```
┌─────────────────┐
│  Local Machine  │
├─────────────────┤
│ • Node.js       │
│ • MongoDB       │
│ • Nodemon       │
│ • Hot Reload    │
└─────────────────┘
```

### 2. Production Environment

```
┌─────────────────┐    ┌─────────────────┐
│  Load Balancer  │    │   Web Server    │
│    (Nginx)      │    │     (PM2)       │
└─────────┬───────┘    └─────────┬───────┘
          │                      │
          ▼                      ▼
┌─────────────────┐    ┌─────────────────┐
│   SSL/TLS       │    │  Application    │
│ Termination     │    │   Processes     │
└─────────────────┘    └─────────┬───────┘
                                 │
                                 ▼
                       ┌─────────────────┐
                       │    Database     │
                       │ (MongoDB Atlas) │
                       └─────────────────┘
```

## Monitoring and Observability

### 1. Logging Architecture

```
┌─────────────────┐    ┌─────────────────┐
│ Application     │    │  Log Aggregator │
│ Logs            │───►│  (Future: ELK)  │
├─────────────────┤    └─────────────────┘
│ • Request logs  │              │
│ • Error logs    │              ▼
│ • Debug logs    │    ┌─────────────────┐
│ • Audit logs    │    │  Log Analysis   │
└─────────────────┘    │ & Alerting      │
                       └─────────────────┘
```

### 2. Health Monitoring

```javascript
// Health check endpoints
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});
```

## Error Handling Architecture

### 1. Error Propagation

```
┌─────────────────┐
│   Controller    │
│   Try/Catch     │
└─────────┬───────┘
          │ Error
          ▼
┌─────────────────┐
│ Error Handler   │
│  Middleware     │
└─────────┬───────┘
          │ Formatted Error
          ▼
┌─────────────────┐
│  Client         │
│ Error Response  │
└─────────────────┘
```

### 2. Error Categories

- **Validation Errors**: 400 Bad Request
- **Authentication Errors**: 401 Unauthorized
- **Authorization Errors**: 403 Forbidden
- **Not Found Errors**: 404 Not Found
- **Server Errors**: 500 Internal Server Error

## Future Architecture Considerations

### 1. Event-Driven Architecture

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Service   │    │   Message   │    │   Service   │
│      A      │───►│    Queue    │───►│      B      │
└─────────────┘    │ (RabbitMQ/  │    └─────────────┘
                   │  Apache     │
                   │  Kafka)     │
                   └─────────────┘
```

### 2. API Gateway Pattern

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │ API Gateway │    │ Microservice│
│ Application │───►│             │───►│  Cluster    │
└─────────────┘    │ • Routing   │    └─────────────┘
                   │ • Auth      │
                   │ • Rate Limit│
                   │ • Logging   │
                   └─────────────┘
```

### 3. CQRS Pattern

```
┌─────────────┐    ┌─────────────┐
│   Command   │    │    Query    │
│   Handler   │    │   Handler   │
└──────┬──────┘    └──────┬──────┘
       │                  │
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│   Write     │    │    Read     │
│  Database   │    │  Database   │
└─────────────┘    └─────────────┘
```

---
*Last updated: $(Get-Date)*