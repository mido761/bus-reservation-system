# Troubleshooting Guide

## Overview
This guide helps diagnose and resolve common issues with the Bus Reservation System, covering both the Node.js backend and the React frontend.

## Table of Contents
1. [Backend: Server Startup Issues](#backend-server-startup-issues)
2. [Backend: Database Connection Problems (PostgreSQL)](#backend-database-connection-problems)
3. [Backend: Authentication & Session Issues](#backend-authentication--session-issues)
4. [Backend: API Endpoint Errors](#backend-api-endpoint-errors)
5. [Frontend: Client Application Issues](#frontend-client-application-issues)
6. [General: CORS Errors](#general-cors-errors)
7. [General: Environment Variable Issues](#general-environment-variable-issues)
8. [Deployment: Vercel Issues](#deployment-vercel-issues)

---

## Backend: Server Startup Issues

### Issue: `ERR_MODULE_NOT_FOUND`
**Symptom:**
```
Error: Cannot find module '/path/to/project/newServer/routers/someRouter.js'
```
**Cause:**
This often happens with ES Modules (`import`/`export`) due to incorrect file paths or missing file extensions.

**Solution:**
1.  **Check the file path**: Ensure the path in the `import` statement is correct relative to the current file.
2.  **Add the `.js` extension**: ES Modules require the full file name, including the extension.
    ```javascript
    // Incorrect
    import busRouter from './routers/busRouter';

    // Correct
    import busRouter from './routers/busRouter.js';
    ```

### Issue: Port Already in Use
**Symptom:**
```
Error: listen EADDRINUSE: address already in use :::5000
```
**Cause:**
Another process is already running on the port the server is trying to use.

**Solution:**
1.  **Find and stop the conflicting process**:
    - **Windows**: `netstat -ano | findstr :5000` then `taskkill /PID <PID> /F`
    - **macOS/Linux**: `lsof -i :5000` then `kill -9 <PID>`
2.  **Change the port**: Modify the `PORT` variable in your `newServer/.env` file.

---

## Backend: Database Connection Problems (PostgreSQL)

### Issue: Connection Failed / Authentication Failure
**Symptom:**
```
error: password authentication failed for user "user_name"
```
or
```
error: connect ECONNREFUSED 127.0.0.1:5432
```
**Cause:**
- Incorrect database credentials.
- The PostgreSQL server is not running.
- Firewall is blocking the connection.

**Solution:**
1.  **Verify `DATABASE_URL`**: Double-check the connection string in `newServer/.env`. It must follow the format: `postgresql://USER:PASSWORD@HOST:PORT/DATABASE`.
2.  **Ensure PostgreSQL is Running**:
    - **Windows**: Check the "Services" application for `postgresql`.
    - **macOS (Homebrew)**: `brew services list`
    - **Linux**: `sudo systemctl status postgresql`
3.  **Check Network/Firewall**: If connecting to a cloud database (like Vercel Postgres, Neon, Supabase), ensure your local IP address is whitelisted in the provider's network settings.

---

## Backend: Authentication & Session Issues

### Issue: Session Not Persisting After Login
**Symptom:**
A user logs in successfully, but on the next request or page refresh, they are no longer authenticated.

**Cause:**
- `express-session` is not configured correctly with the PostgreSQL store.
- The browser is not sending the session cookie.

**Solution:**
1.  **Check Session Middleware Configuration**: In `newServer/index.js`, ensure `express-session` is set up *before* your routers and that `connect-pg-simple` is correctly configured.
    ```javascript
    import session from 'express-session';
    import connectPgSimple from 'connect-pg-simple';

    const pgSession = connectPgSimple(session);

    app.use(session({
        store: new pgSession({
            pool: db.pool, // Ensure this is your pg pool
            tableName: 'session'
        }),
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: {
            // ... cookie settings
        }
    }));
    ```
2.  **Verify `credentials: true` in CORS**: The frontend can only send cookies if the backend's CORS configuration includes `credentials: true`.
3.  **Check Browser Dev Tools**: In the "Application" tab (Chrome) or "Storage" tab (Firefox), verify that a session cookie is being set for the backend's domain after login.

---

## Backend: API Endpoint Errors

### Issue: `404 Not Found`
**Symptom:**
A request to an API endpoint returns a 404 error.

**Cause:**
- The URL is misspelled on the frontend.
- The route is not registered correctly in `newServer/index.js`.
- The HTTP method (`GET`, `POST`, etc.) does not match.

**Solution:**
1.  **Check Frontend API Call**: Verify the URL and method in your `axios` or `fetch` call.
2.  **Check Backend Router**: Ensure the route is defined in the correct router file and that the router is included in `newServer/index.js` with `app.use()`.
    ```javascript
    // newServer/index.js
    import tripRouter from './routers/tripRouter.js';
    app.use('/trip', tripRouter); // Correct base path
    ```

### Issue: `500 Internal Server Error`
**Symptom:**
The server crashes or returns a generic 500 error for a specific request.

**Cause:**
A runtime error occurred in the backend code (e.g., trying to access a property of `undefined`, database query failed).

**Solution:**
1.  **Check Vercel Logs / Terminal Output**: The logs will contain the exact error message and a stack trace pointing to the problematic line of code.
2.  **Use `try...catch` Blocks**: Wrap your controller logic in `try...catch` blocks to handle unexpected errors gracefully and return a meaningful error message.
    ```javascript
    export const someController = async (req, res) => {
        try {
            // Risky code here
        } catch (error) {
            console.error("Error in someController:", error);
            res.status(500).json({ message: "An internal server error occurred." });
        }
    };
    ```

---

## Frontend: Client Application Issues

### Issue: Blank White Screen
**Symptom:**
The application does not render and shows a blank page.

**Cause:**
A critical JavaScript error is preventing React from rendering.

**Solution:**
1.  **Open Browser Dev Tools**: Open the developer console (`F12` or `Ctrl+Shift+I`). The error message will be displayed there.
2.  **Common Errors**:
    - "Cannot read properties of undefined"
    - "X is not a function"
    - Errors related to `react-router-dom` setup.

### Issue: API Calls Fail, Data Doesn't Load
**Symptom:**
The UI loads, but lists are empty, and data-driven components don't appear.

**Cause:**
- The backend server is not running.
- The `VITE_API_URL` environment variable is incorrect.
- A CORS error is blocking the request.

**Solution:**
1.  **Check the Network Tab**: Open browser dev tools and go to the "Network" tab. Find the failing API request (it will likely be red). Click on it to see the status code and response.
2.  **Verify `VITE_API_URL`**: Ensure the `.env.local` file exists in the `client` directory and that `VITE_API_URL` points to your running backend (e.g., `http://localhost:5000`).
3.  **Restart the Vite Dev Server**: After changing `.env` files, you must restart the dev server.

---

## General: CORS Errors

### Issue: `has been blocked by CORS policy`
**Symptom:**
The browser console shows a CORS error, and the network request fails.

**Cause:**
The backend did not approve the request from the frontend's origin.

**Solution:**
1.  **Check Backend CORS Configuration**: In `newServer/index.js`, ensure the `origin` in your `cors` options includes the frontend's URL.
    ```javascript
    const allowedOrigins = [
        'http://localhost:5173', // Vite dev server
        process.env.FRONT_END_URL // Production URL
    ];

    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            } else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true
    }));
    ```
2.  **Verify `FRONT_END_URL`**: Make sure the `FRONT_END_URL` environment variable on the backend is set to the correct frontend production URL.

---

## General: Environment Variable Issues

### Issue: `process.env.VARIABLE` is `undefined`
**Symptom:**
The application crashes, complaining that a variable read from `process.env` is undefined.

**Cause:**
- The `.env` file is missing or in the wrong directory.
- The variable name is misspelled.

**Solution:**
1.  **File Location**:
    - For the backend, the `.env` file must be in the `newServer/` directory.
    - For the frontend, the `.env.local` file must be in the `client/` directory.
2.  **Variable Naming (Frontend)**: For Vite, all environment variables exposed to the client **must** be prefixed with `VITE_`.
3.  **Server Restart**: Always restart your server (`newServer` or `client`) after creating or modifying environment files.

---

## Deployment: Vercel Issues

### Issue: Build Fails
**Symptom:**
The Vercel deployment fails during the "Building" step.

**Cause:**
- Incorrect Node.js version.
- Missing dependencies or a broken `package-lock.json`.
- Build command is incorrect.

**Solution:**
1.  **Check Vercel Build Logs**: The logs will show the exact command that failed.
2.  **Check Node.js Version**: In your Vercel project settings, go to "General" and ensure the Node.js version matches what you use locally (e.g., 18.x).
3.  **Set Root Directory**: Ensure the "Root Directory" in your Vercel project settings is correctly set to `newServer` or `client`.

### Issue: Serverless Function Crashes
**Symptom:**
The application deploys, but API endpoints return a `500` error.

**Cause:**
A runtime error is happening in the backend code, often related to missing environment variables.

**Solution:**
1.  **Check Vercel Runtime Logs**: Go to the "Logs" tab in your Vercel project dashboard to see the live error messages from your backend code.
2.  **Verify Production Environment Variables**: Go to the "Settings" -> "Environment Variables" tab for your backend project on Vercel. Ensure **all** required variables (`DATABASE_URL`, `SESSION_SECRET`, etc.) are present and correct for the production environment.

---
*Last updated: $(Get-Date)*