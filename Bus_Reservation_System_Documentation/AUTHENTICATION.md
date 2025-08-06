# Authentication & Authorization Documentation

## Overview
The Bus Reservation System implements a comprehensive authentication and authorization system using session-based authentication, role-based access control, and secure password management.

## Authentication Flow

### 1. User Registration
```
User submits registration form
↓
System validates email uniqueness
↓
Password is hashed using bcrypt
↓
User record created in database
↓
Email verification code sent
↓
User verifies email to activate account
```

### 2. Login Process
```
User submits email/password
↓
System finds user by email
↓
Password compared using bcrypt
↓
Session created and regenerated
↓
User ID and role stored in session
↓
Success response sent
```

### 3. Session Management
```
Session stored in MongoDB using connect-mongo
↓
Session cookie sent to client
↓
Subsequent requests include session cookie
↓
Middleware validates session on protected routes
```

## Security Implementation

### Password Security
- **Hashing**: bcrypt with salt rounds (default: 10)
- **Minimum Length**: 6 characters
- **Storage**: Only hashed passwords stored in database

```javascript
// Password hashing during registration
const hashedPassword = await bcrypt.hash(password, 10);

// Password verification during login
const isPasswordValid = await bcrypt.compare(password, user.password);
```

### Session Configuration
```javascript
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production", // HTTPS in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));
```

### Session Properties
- **httpOnly**: Prevents XSS attacks
- **sameSite**: CSRF protection
- **secure**: HTTPS only in production
- **maxAge**: 24-hour expiration

## Authorization System

### Middleware Functions

#### `isAuthenticated` Middleware
**File**: `controllers/middleware.js`
**Purpose**: Verify user is logged in
```javascript
const isAuthenticated = (req, res, next) => {
  // Development bypass
  if (process.env.NODE_ENV === "development") return next();
  
  if (req.session && req.session.userId) {
    return next();
  }
  return res.status(401).json({ message: "unauthenticated: Please log in" });
};
```

#### `isAuthoraized` Middleware (Admin Check)
**File**: `controllers/middleware.js`
**Purpose**: Verify user has admin privileges
```javascript
const isAuthoraized = (req, res, next) => {
  // Development bypass
  if (process.env.NODE_ENV === "development") return next();
  
  if (req.session && req.session.userId && req.session.userRole === "admin") {
    return next();
  }
  return res.status(401).json({ message: "Unauthorized, Access denied" });
};
```

### Role-Based Access Control

#### User Roles
1. **user**: Regular customers
   - Can book seats
   - View own bookings
   - Update profile
   - Access contact support

2. **admin**: System administrators
   - All user permissions
   - Manage buses and routes
   - View all users and bookings
   - Access blacklist management
   - Driver management
   - System analytics

#### Protected Routes
```javascript
// User Authentication Required
app.use("/user", middleware.isAuthenticated, userRouter);
app.use("/seats", middleware.isAuthenticated, FormSeats);
app.use("/form", middleware.isAuthenticated, formRouter);
app.use("/formselection", middleware.isAuthenticated, formBookingRouter);
app.use("/contact", middleware.isAuthenticated, contactRoutes);

// Admin Authorization Required
app.use("/blacklist", middleware.isAuthoraized, blackList);
app.use("/driver-list", middleware.isAuthenticated, driverList);
```

## Password Reset System

### Security Features
- Time-limited verification codes (1 hour)
- 6-digit numeric codes
- Email-based delivery
- Single-use codes
- Secure code generation

### Process Flow
```
User requests password reset
↓
System generates 6-digit code
↓
Code stored with expiration time
↓
Email sent with verification code
↓
User submits code + new password
↓
System verifies code and timing
↓
Password updated and code cleared
```

### Implementation
```javascript
// Generate reset code
const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

// Store in user record
user.resetPasswordCode = resetCode;
user.resetPasswordExpires = expirationTime;

// Verify code during reset
if (user.resetPasswordCode !== code || 
    user.resetPasswordExpires < new Date()) {
  return res.status(400).json("Invalid or expired code");
}
```

## Email Verification

### Registration Verification
- New users receive verification email
- Account activated after email confirmation
- Prevents fake email registrations

### Email Configuration
```javascript
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});
```

## Session Utilities

### Session Management Functions
**File**: `utils/session.js`

#### Session Regeneration
```javascript
module.exports.regenerate = (req, res, user) => {
  req.session.regenerate((err) => {
    if (err) return res.status(500).json("Session error");
    
    req.session.userId = user._id;
    req.session.userRole = user.role;
    
    req.session.save((err) => {
      if (err) return res.status(500).json("Failed to save session");
      return res.status(200).json("Login successful");
    });
  });
};
```

#### Session Destruction
```javascript
module.exports.destroy = (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).json("failed to logout");
    res.clearCookie("connect.sid");
    return res.status(200).json("logout successfuly");
  });
};
```

## Security Best Practices

### Environment-Based Security
- Development mode bypasses for testing
- Production mode enforces all security measures
- Environment variables for sensitive data

### CORS Configuration
```javascript
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000", 
  process.env.BACK_END_URL
];

app.use(cors({
  origin: allowedOrigins,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
```

### Input Validation
- Email format validation
- Password strength requirements
- Phone number format checking
- Role enum validation

## Common Security Vulnerabilities Addressed

### 1. Session Fixation
- Session regeneration on login
- New session ID after authentication

### 2. Cross-Site Scripting (XSS)
- httpOnly cookies
- Input sanitization
- Content-Type headers

### 3. Cross-Site Request Forgery (CSRF)
- sameSite cookie attribute
- Origin validation
- CORS configuration

### 4. Brute Force Attacks
- Consider implementing rate limiting
- Account lockout after failed attempts
- Captcha for repeated failures

### 5. Man-in-the-Middle
- HTTPS enforcement in production
- Secure cookie flags
- Certificate validation

## Development vs Production

### Development Mode
```javascript
if (process.env.NODE_ENV === "development") return next();
```
- Authentication bypass for testing
- Less restrictive security settings
- Detailed error messages

### Production Mode
- Full authentication enforcement
- Secure cookie settings
- Minimal error exposure
- HTTPS requirement

## Troubleshooting Authentication Issues

### Common Problems
1. **Session not persisting**
   - Check MongoDB connection
   - Verify session store configuration
   - Ensure cookies are enabled

2. **CORS errors**
   - Verify allowed origins
   - Check credentials setting
   - Validate request headers

3. **Password reset not working**
   - Check email configuration
   - Verify code expiration
   - Ensure proper error handling

### Debug Commands
```javascript
// Check session in middleware
console.log(req.session, req.session.userId);

// Verify password hash
console.log(await bcrypt.compare(password, hashedPassword));

// Check user role
console.log(req.session.userRole);
```

---
*Last updated: $(Get-Date)*