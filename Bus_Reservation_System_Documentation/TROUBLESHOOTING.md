# Troubleshooting Guide

## Overview
This guide helps diagnose and resolve common issues with the Bus Reservation System backend. Issues are organized by category with step-by-step solutions.

## Table of Contents
1. [Server Startup Issues](#server-startup-issues)
2. [Database Connection Problems](#database-connection-problems)
3. [Authentication Issues](#authentication-issues)
4. [API Endpoint Errors](#api-endpoint-errors)
5. [Environment Variable Issues](#environment-variable-issues)
6. [Real-time Features Not Working](#real-time-features-not-working)
7. [Email Service Issues](#email-service-issues)
8. [Performance Problems](#performance-problems)
9. [CORS Errors](#cors-errors)
10. [Deployment Issues](#deployment-issues)

## Server Startup Issues

### Issue: Router.use() requires a middleware function but got a Object

**Symptoms:**
```
TypeError: Router.use() requires a middleware function but got a Object
    at Function.use (/node_modules/express/lib/router/index.js:469:13)
```

**Causes:**
- Route file not exporting Express router properly
- Import/export mismatch in route files
- Missing route file dependencies

**Solutions:**
1. **Check route file exports:**
   ```javascript
   // Correct export in route file
   const express = require('express');
   const router = express.Router();
   
   // Define routes...
   router.get('/', (req, res) => {});
   
   module.exports = router; // Make sure this exists
   ```

2. **Verify route imports:**
   ```javascript
   // In server/index.js
   const userRouter = require('./routes/userRoutes'); // Check path
   app.use('/user', userRouter);
   ```

3. **Debug route by route:**
   - Comment out all route imports
   - Add them back one by one to identify the problematic route
   - Check the specific route file for syntax errors

### Issue: Port Already in Use

**Symptoms:**
```
Error: listen EADDRINUSE: address already in use :::5000
```

**Solutions:**
1. **Find and kill process:**
   ```bash
   # Find process using port 5000
   netstat -ano | findstr :5000
   # Kill the process (replace PID)
   taskkill /PID <PID> /F
   ```

2. **Change port:**
   ```javascript
   // In .env file
   PORT=5001
   ```

3. **Use different port in development:**
   ```bash
   npm run dev -- --port=5001
   ```

### Issue: Module Not Found

**Symptoms:**
```
Error: Cannot find module './routes/someRoute'
```

**Solutions:**
1. **Check file path:**
   ```javascript
   // Verify relative path is correct
   const router = require('./routes/userRoutes'); // Check if file exists
   ```

2. **Check file extensions:**
   ```javascript
   // Some systems require explicit .js extension
   const router = require('./routes/userRoutes.js');
   ```

3. **Verify file exists:**
   ```bash
   ls -la server/routes/
   ```

## Database Connection Problems

### Issue: MongoDB Connection Failed

**Symptoms:**
```
MongoServerError: bad auth : authentication failed
MongoDB connection error: MongoNetworkError
```

**Solutions:**
1. **Check connection string:**
   ```env
   # Local MongoDB
   MONGO_URI=mongodb://localhost:27017/bus_reservation_system
   
   # MongoDB Atlas
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/database
   ```

2. **Verify MongoDB service:**
   ```bash
   # Windows
   net start MongoDB
   
   # Linux/macOS
   sudo systemctl start mongod
   # or
   brew services start mongodb-community
   ```

3. **Check authentication:**
   ```javascript
   // If using authentication
   MONGO_URI=mongodb://username:password@localhost:27017/database
   ```

4. **Network connectivity:**
   ```bash
   # Test MongoDB connection
   mongosh "mongodb://localhost:27017"
   
   # For Atlas, check IP whitelist
   ```

### Issue: Database Connection Timeout

**Symptoms:**
```
MongoServerSelectionError: connection timed out
```

**Solutions:**
1. **Check firewall settings**
2. **Verify MongoDB is running**
3. **Check network connectivity**
4. **For Atlas: Whitelist IP address**

## Authentication Issues

### Issue: Session Not Persisting

**Symptoms:**
- User appears logged in but session lost on refresh
- Authentication middleware fails randomly

**Solutions:**
1. **Check session store:**
   ```javascript
   // Verify MongoDB store is working
   store: MongoStore.create({ 
     mongoUrl: process.env.MONGO_URI,
     touchAfter: 24 * 3600 // 24 hours
   })
   ```

2. **Cookie configuration:**
   ```javascript
   cookie: {
     httpOnly: true,
     sameSite: "strict",
     secure: process.env.NODE_ENV === "production",
     maxAge: 24 * 60 * 60 * 1000
   }
   ```

3. **HTTPS in production:**
   ```javascript
   // Ensure secure cookies in production
   secure: process.env.NODE_ENV === "production"
   ```

### Issue: Password Reset Not Working

**Symptoms:**
- Reset emails not sent
- Invalid code errors
- Codes expire immediately

**Solutions:**
1. **Check email configuration:**
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password  # Not regular password
   ```

2. **Verify code generation:**
   ```javascript
   // Check code expiration time
   const expirationTime = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
   ```

3. **Debug email sending:**
   ```javascript
   // Add logging to email function
   console.log('Attempting to send email to:', email);
   ```

## API Endpoint Errors

### Issue: 404 Not Found

**Symptoms:**
```
Cannot GET /api/some-endpoint
```

**Solutions:**
1. **Check route registration:**
   ```javascript
   // Verify route is registered in index.js
   app.use('/api/auth', authRouter);
   ```

2. **Verify route definition:**
   ```javascript
   // In route file
   router.post('/login', loginController);
   ```

3. **Check URL path:**
   ```javascript
   // Request: POST /api/auth/login
   // Route: app.use('/api/auth', authRouter)
   // Handler: router.post('/login', ...)
   ```

### Issue: 500 Internal Server Error

**Symptoms:**
- Server crashes on specific requests
- Undefined variable errors

**Solutions:**
1. **Check server logs:**
   ```bash
   # PM2 logs
   pm2 logs
   
   # Direct logs
   tail -f logs/combined.log
   ```

2. **Add error handling:**
   ```javascript
   router.post('/endpoint', async (req, res) => {
     try {
       // Your code here
     } catch (error) {
       console.error('Error:', error);
       res.status(500).json({ error: 'Internal server error' });
     }
   });
   ```

3. **Validate request data:**
   ```javascript
   const { email, password } = req.body;
   if (!email || !password) {
     return res.status(400).json({ error: 'Missing required fields' });
   }
   ```

## Environment Variable Issues

### Issue: Environment Variables Not Loading

**Symptoms:**
```
process.env.MONGO_URI is undefined
```

**Solutions:**
1. **Check .env file location:**
   ```
   project-root/
   ├── .env          # Should be here
   ├── server/
   └── client/
   ```

2. **Verify dotenv configuration:**
   ```javascript
   // At top of index.js
   require('dotenv').config();
   ```

3. **Check .env syntax:**
   ```env
   # Correct syntax
   MONGO_URI=mongodb://localhost:27017/busdb
   
   # Wrong syntax (no spaces around =)
   MONGO_URI = mongodb://localhost:27017/busdb
   ```

4. **Environment-specific files:**
   ```bash
   # Development
   .env.development
   
   # Production
   .env.production
   ```

### Issue: Variables Not Loading in Production

**Solutions:**
1. **Heroku:**
   ```bash
   heroku config:set MONGO_URI=your_uri
   ```

2. **PM2:**
   ```javascript
   // ecosystem.config.js
   env_production: {
     NODE_ENV: 'production',
     MONGO_URI: 'your_production_uri'
   }
   ```

3. **Docker:**
   ```dockerfile
   ENV MONGO_URI=your_uri
   ```

## Real-time Features Not Working

### Issue: Pusher Not Connecting

**Symptoms:**
- Real-time updates not working
- Pusher connection errors

**Solutions:**
1. **Check Pusher credentials:**
   ```env
   PUSHER_APP_ID=your_app_id
   PUSHER_KEY=your_key
   PUSHER_SECRET=your_secret
   PUSHER_CLUSTER=your_cluster
   ```

2. **Verify Pusher configuration:**
   ```javascript
   const pusher = new Pusher({
     appId: process.env.PUSHER_APP_ID,
     key: process.env.PUSHER_KEY,
     secret: process.env.PUSHER_SECRET,
     cluster: process.env.PUSHER_CLUSTER,
     useTLS: true
   });
   ```

3. **Test Pusher connection:**
   ```javascript
   // Add debug logging
   pusher.trigger("test-channel", "test-event", {
     message: "hello world"
   }).then(() => {
     console.log('Pusher message sent successfully');
   }).catch(error => {
     console.error('Pusher error:', error);
   });
   ```

## Email Service Issues

### Issue: Gmail Authentication Failed

**Symptoms:**
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

**Solutions:**
1. **Use App Password:**
   - Enable 2FA on Gmail
   - Generate App Password
   - Use App Password instead of regular password

2. **Check Gmail settings:**
   ```env
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_16_character_app_password
   ```

3. **Alternative SMTP:**
   ```javascript
   const transporter = nodemailer.createTransporter({
     host: 'smtp.gmail.com',
     port: 587,
     secure: false,
     auth: {
       user: process.env.EMAIL_USER,
       pass: process.env.EMAIL_PASS
     }
   });
   ```

### Issue: Emails Not Being Sent

**Solutions:**
1. **Test email configuration:**
   ```javascript
   // Add to route for testing
   router.post('/test-email', async (req, res) => {
     try {
       await transporter.sendMail({
         from: process.env.EMAIL_USER,
         to: 'test@example.com',
         subject: 'Test Email',
         text: 'This is a test email'
       });
       res.json({ message: 'Email sent successfully' });
     } catch (error) {
       res.status(500).json({ error: error.message });
     }
   });
   ```

2. **Check email templates:**
   - Verify HTML templates are valid
   - Check for missing variables

## Performance Problems

### Issue: Slow Response Times

**Solutions:**
1. **Database indexing:**
   ```javascript
   // Add indexes to frequently queried fields
   userSchema.index({ email: 1 });
   busSchema.index({ 'route.from': 1, 'route.to': 1 });
   ```

2. **Query optimization:**
   ```javascript
   // Use projection to limit returned fields
   User.findById(userId).select('name email');
   
   // Use lean() for read-only queries
   Bus.find({ status: 'active' }).lean();
   ```

3. **Connection pooling:**
   ```javascript
   mongoose.connect(MONGO_URI, {
     maxPoolSize: 10,
     bufferMaxEntries: 0
   });
   ```

### Issue: Memory Leaks

**Solutions:**
1. **Monitor memory usage:**
   ```bash
   pm2 monit
   ```

2. **Add memory limits:**
   ```javascript
   // ecosystem.config.js
   max_memory_restart: '1G'
   ```

3. **Close database connections:**
   ```javascript
   // Ensure proper cleanup
   process.on('SIGINT', async () => {
     await mongoose.connection.close();
     process.exit(0);
   });
   ```

## CORS Errors

### Issue: CORS Policy Blocking Requests

**Symptoms:**
```
Access to fetch at 'http://localhost:5000/api/login' from origin 'http://localhost:3000' has been blocked by CORS policy
```

**Solutions:**
1. **Update allowed origins:**
   ```javascript
   const allowedOrigins = [
     "http://localhost:5173",
     "http://localhost:3000",
     "https://yourdomain.com",
     process.env.FRONT_END_URL
   ];
   ```

2. **Enable credentials:**
   ```javascript
   app.use(cors({
     origin: allowedOrigins,
     credentials: true
   }));
   ```

3. **Handle preflight requests:**
   ```javascript
   app.options("*", (req, res) => {
     res.setHeader("Access-Control-Allow-Origin", allowedOrigins);
     res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
     res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
     res.setHeader("Access-Control-Allow-Credentials", "true");
     res.sendStatus(200);
   });
   ```

## Deployment Issues

### Issue: Application Fails to Start in Production

**Solutions:**
1. **Check environment variables:**
   ```bash
   # Verify all required variables are set
   echo $MONGO_URI
   echo $SESSION_SECRET
   ```

2. **Check file permissions:**
   ```bash
   chmod +x server/index.js
   chown -R appuser:appuser /path/to/app
   ```

3. **Review PM2 logs:**
   ```bash
   pm2 logs --lines 50
   ```

### Issue: SSL Certificate Problems

**Solutions:**
1. **Verify certificate installation:**
   ```bash
   sudo certbot certificates
   ```

2. **Check Nginx configuration:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

3. **Test SSL:**
   ```bash
   openssl s_client -connect yourdomain.com:443
   ```

## Debugging Techniques

### 1. Enable Debug Logging
```javascript
// Add debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`, req.body);
  next();
});
```

### 2. Test Individual Components
```javascript
// Test database connection
mongoose.connection.on('connected', () => {
  console.log('MongoDB connected successfully');
});

// Test email service
app.get('/test-email', async (req, res) => {
  // Email test code
});
```

### 3. Use Process Monitoring
```bash
# Monitor with PM2
pm2 monit

# Check system resources
htop
```

### 4. Network Debugging
```bash
# Test endpoints
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Check port status
netstat -tlnp | grep 5000
```

## Getting Help

### 1. Check Logs First
- Always check server logs for specific error messages
- Look for stack traces and line numbers

### 2. Isolate the Problem
- Test components individually
- Use minimal reproduction cases

### 3. Search Documentation
- Check this documentation first
- Review API documentation
- Look up specific error messages

### 4. Community Resources
- Stack Overflow
- GitHub Issues
- MongoDB Community Forums
- Express.js Documentation

---
*Last updated: $(Get-Date)*