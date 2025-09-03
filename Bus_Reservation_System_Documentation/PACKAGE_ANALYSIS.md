# Package Analysis & Dependencies

## Overview
This document provides a detailed analysis of the `package.json` files for both the backend (`newServer`) and frontend (`client`) of the Bus Reservation System. It clarifies the role of each dependency and script and provides recommendations for cleanup and optimization.

**Note:** The project's dependency management is currently disorganized. The root `package.json` serves the backend but contains frontend libraries, while `client/package.json` contains backend libraries. This analysis categorizes packages by their actual use, not their location, and recommends corrections.

---

## 1. Backend Package Analysis (`/package.json`)

The root `package.json` is responsible for running the backend server located in the `newServer/` directory.

### Backend Scripts

-   `"newServer": "nodemon newServer/index.js"`
    -   **Purpose**: Runs the backend server in development mode using `nodemon`, which automatically restarts the server on file changes.
    -   **Usage**: `npm run newServer`

-   `"start": "node newServer/index.js"`
    -   **Purpose**: Starts the backend server for production.
    -   **Usage**: `npm start`

-   `"dev": "npm run build --prefix client && nodemon newServer/index.js"`
    -   **Purpose**: A convenience script that first builds the production version of the frontend and then starts the backend development server.
    -   **Usage**: `npm run dev`

-   `"test": "jest --verbose"`
    -   **Purpose**: Runs backend tests using the Jest testing framework.
    -   **Usage**: `npm test`

### Core Backend Dependencies (`dependencies`)

| Package             | Version   | Description                                                                                             |
| ------------------- | --------- | ------------------------------------------------------------------------------------------------------- |
| `express`           | `^4.21.2` | The core web server framework for Node.js, used to build the REST API, handle routes, and middleware.     |
| `pg`                | `^8.16.3` | The PostgreSQL client for Node.js. Used to connect to and query the PostgreSQL database.                |
| `express-session`   | `^1.18.1` | Middleware for managing user sessions and storing session data.                                         |
| `connect-pg-simple` | `^10.0.0` | A session store for `express-session` that saves session data in the PostgreSQL database.                 |
| `cors`              | `^2.8.5`  | Middleware to enable Cross-Origin Resource Sharing, allowing the frontend to make requests to the backend. |
| `dotenv`            | `^16.4.7` | Loads environment variables from a `.env` file into `process.env`.                                      |
| `bcrypt`            | `^5.1.1`  | A library for hashing passwords securely before storing them in the database.                           |
| `joi`               | `^18.0.0` | A powerful schema description language and data validator for JavaScript. Used for validating request bodies. |
| `nodemailer`        | `^6.10.0` | A module for sending emails, used for features like password reset and email verification.              |
| `node-cron`         | `^4.2.1`  | A simple cron-like job scheduler for Node.js. Used for running scheduled tasks.                         |
| `validator`         | `^13.15.15`| A library of string validators and sanitizers. Used for input validation.                               |

### Development Dependencies (`devDependencies`)

| Package   | Version   | Description                                                              |
| --------- | --------- | ------------------------------------------------------------------------ |
| `jest`    | `^30.0.5` | A delightful JavaScript Testing Framework with a focus on simplicity.    |
| `nodemon` | `^3.1.10` | A tool that helps develop Node.js based applications by automatically restarting the node application when file changes in the directory are detected. Found in `dependencies` but should be in `devDependencies`. |

---

## 2. Frontend Package Analysis (`/client/package.json`)

The `client/package.json` file is responsible for the React frontend application.

### Frontend Scripts

-   `"dev": "vite"`
    -   **Purpose**: Starts the Vite development server for a fast, modern frontend development experience with Hot Module Replacement (HMR).
    -   **Usage**: `npm run dev --prefix client`

-   `"build": "vite build"`
    -   **Purpose**: Bundles the React application into static files for production deployment.
    -   **Usage**: `npm run build --prefix client`

-   `"lint": "eslint ."`
    -   **Purpose**: Runs ESLint to find and fix problems in the JavaScript code.
    -   **Usage**: `npm run lint --prefix client`

### Core Frontend Dependencies

| Package              | Version    | Description                                                                                             |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------------------- |
| `react`              | `^18.3.1`  | A JavaScript library for building user interfaces.                                                      |
| `react-dom`          | `^18.3.1`  | Serves as the entry point to the DOM and server renderers for React.                                    |
| `vite`               | `^6.0.11`  | A next-generation frontend tooling that provides a faster and leaner development experience.            |
| `@vitejs/plugin-react`| `^4.3.4`   | The official Vite plugin for React projects.                                                            |
| `axios`              | `^1.7.9`   | A promise-based HTTP client for making requests from the browser to the backend API.                    |
| `react-router-dom`   | `^7.8.2`   | The standard library for routing in React, enabling navigation and view composition.                    |
| `bootstrap`          | `^5.3.3`   | A popular CSS framework for designing responsive and mobile-first websites.                             |
| `react-bootstrap`    | `^2.10.7`  | A library that replaces Bootstrap's JavaScript with React components.                                   |
| `react-toastify`     | `^11.0.5`  | A library for adding notifications (toasts) to the application.                                         |
| `qrcode.react`       | `^4.2.0`   | A React component for generating QR codes.                                                              |
| `jwt-decode`         | `^4.0.0`   | A small browser-friendly library that decodes JWTs.                                                     |

---

## 3. Dependency Cleanup Recommendations

The current dependency setup is confusing and can lead to larger-than-necessary build sizes and maintenance issues.

### Step 1: Clean up Backend Dependencies (`/package.json`)
The following packages are frontend-specific or redundant and should be **removed** from the root `package.json`. They belong in `client/package.json` if needed.

-   `axios`
-   `bcryptjs` (Redundant, `bcrypt` is already in use)
-   `connect-mongo` (Project uses PostgreSQL, not MongoDB)
-   `date-fns` and `luxon` (Choose one if needed for server-side date logic, otherwise remove)
-   `jwt-decode`
-   `lucide-react`
-   `mongoose` (Project uses PostgreSQL, not MongoDB)
-   `pusher-js`
-   `qrcode.react`
-   `react-icons`
-   `react-toastify`

Also, move `nodemon` from `dependencies` to `devDependencies`.

### Step 2: Clean up Frontend Dependencies (`/client/package.json`)
The following packages are backend-specific and should be **removed** from `client/package.json`. The `server: "file:.."` entry is unconventional and should also be removed in favor of running the client and server as separate processes that communicate over HTTP.

-   `@babel/core`, `@babel/preset-env`, `@babel/preset-react`, `babel-loader` (These are typically for Webpack setups; Vite handles this internally. They can likely be removed.)
-   `bcrypt`
-   `connect-mongo`
-   `cors`
-   `dotenv` (Vite uses its own system for `.env` files)
-   `express`
-   `express-session`
-   `mongoose`
-   `nodemon`
-   `server: "file:.."`

By cleaning up these files, you will have a much clearer and more maintainable project structure, with a distinct separation between backend and frontend concerns.

---
*Last updated: $(Get-Date)*