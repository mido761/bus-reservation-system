# Deployment Documentation

## Overview
This document provides deployment instructions for the Bus Reservation System, which consists of a React frontend and a Node.js/Express backend. The primary deployment platform covered is Vercel, which is ideal for this stack.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Environment Variables](#environment-variables)
4. [Local Development](#local-development)
5. [Production Deployment with Vercel](#production-deployment-with-vercel)
6. [Database Deployment](#database-deployment)
7. [Monitoring and Logging](#monitoring-and-logging)

## Prerequisites
- **Node.js**: v18.0 or higher
- **npm** or **yarn**
- **PostgreSQL**: A running instance (local or cloud-based)
- **Git**: For version control and deployment
- **Vercel Account**: For production deployment

## Project Structure
The project is a monorepo with two main parts:
- `client/`: The React frontend application built with Vite.
- `newServer/`: The Node.js/Express backend API.

## Environment Variables

### Backend (`newServer/`)
Create a `.env` file in the `newServer/` directory. This is crucial for both local development and as a reference for Vercel.

```env
# Server Configuration
NODE_ENV=development # 'production' on Vercel
PORT=5000

# Database Connection
# Example for a local PostgreSQL instance
DATABASE_URL="postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/bus_reservation"

# Session Management
SESSION_SECRET="your_super_secure_and_long_session_secret"

# Email Service (Nodemailer)
EMAIL_USER="your_email@example.com"
EMAIL_PASS="your_email_app_password"

# Frontend URL for CORS
FRONT_END_URL="http://localhost:5173" # Your frontend's local address
```

### Frontend (`client/`)
Create a `.env.local` file in the `client/` directory.

```env
# The URL of your backend API
VITE_API_URL="http://localhost:5000"
```

## Local Development

### 1. Setup the Database
- Install PostgreSQL on your local machine.
- Create a new database (e.g., `bus_reservation`).
- Run the `DBcreation.sql` script to create the necessary tables.
  ```bash
  psql -U YOUR_USER -d bus_reservation -f ../Bus_Reservation_System_Documentation/DBcreation.sql
  ```

### 2. Run the Backend Server
```bash
# Navigate to the backend directory
cd newServer

# Install dependencies
npm install

# Start the development server
npm run dev
```
The backend will be running at `http://localhost:5000`.

### 3. Run the Frontend Application
```bash
# Open a new terminal and navigate to the frontend directory
cd client

# Install dependencies
npm install

# Start the development server
npm run dev
```
The frontend will be running at `http://localhost:5173`.

## Production Deployment with Vercel

This project is configured for easy deployment on Vercel. You will deploy the frontend and backend as two separate Vercel projects connected via environment variables.

### 1. Deploying the Backend (`newServer`)
1.  **Create a New Vercel Project**: Link your Git repository to Vercel.
2.  **Configure Project**:
    - **Framework Preset**: Select `Express.js / Node.js`.
    - **Root Directory**: Set to `newServer`.
    - **Build & Development Settings**: Vercel will likely detect the settings from `package.json`. The `vercel.json` file in the root is configured to correctly handle the Express app.
3.  **Add Environment Variables**: In the Vercel project settings, add all the environment variables from your `newServer/.env` file.
    - `NODE_ENV`: Set to `production`.
    - `DATABASE_URL`: Use the connection string from your cloud PostgreSQL provider (see [Database Deployment](#database-deployment)).
    - `FRONT_END_URL`: Set to the URL of your deployed frontend (you'll get this after deploying the client).
    - `SESSION_SECRET`: Use a strong, randomly generated string.
4.  **Deploy**: Vercel will build and deploy your backend. Once complete, you will get a production URL (e.g., `your-backend.vercel.app`).

### 2. Deploying the Frontend (`client`)
1.  **Create Another Vercel Project**: Link the same Git repository.
2.  **Configure Project**:
    - **Framework Preset**: Select `Vite`.
    - **Root Directory**: Set to `client`.
    - **Build & Development Settings**:
        - **Build Command**: `npm run build`
        - **Output Directory**: `dist`
3.  **Add Environment Variables**:
    - `VITE_API_URL`: Set this to the production URL of your deployed backend (e.g., `https://your-backend.vercel.app`).
4.  **Deploy**: Vercel will build and deploy your frontend.

### 3. Final Configuration
- Go back to your backend project's settings on Vercel.
- Update the `FRONT_END_URL` environment variable with your final frontend production URL.
- Redeploy the backend project to apply the change.

## Database Deployment

For production, it is highly recommended to use a managed cloud PostgreSQL provider.

**Recommended Providers:**
- **Vercel Postgres**
- **Supabase**
- **Neon**
- **Railway**

### General Steps:
1.  **Create an Account**: Sign up for one of the providers.
2.  **Create a New Project/Database**: Follow their instructions to spin up a new PostgreSQL database.
3.  **Get the Connection String**: The provider will give you a `DATABASE_URL` (connection string) that looks something like this: `postgresql://user:password@host:port/database`.
4.  **Run SQL Script**: Use a tool like `psql` or a GUI client (e.g., DBeaver, Postico) to connect to your cloud database and run the `DBcreation.sql` script to set up your schema.
5.  **Update Environment Variables**: Use this `DATABASE_URL` for the `DATABASE_URL` environment variable in your backend Vercel project.

## Monitoring and Logging

Vercel provides powerful tools for monitoring and logging out-of-the-box.
- **Logs**: In your Vercel project dashboard, navigate to the "Logs" tab to see real-time logs for your serverless functions (backend) or build logs (frontend).
- **Analytics**: Vercel Analytics can be enabled to monitor traffic and performance.
- **Health Checks**: The backend includes a `/health` endpoint that can be used for uptime monitoring services.

---
*Last updated: $(Get-Date)*