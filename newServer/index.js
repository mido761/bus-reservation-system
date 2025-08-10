const express = require("express");
const cors = require("cors");
const session = require("express-session");
const mongoose = require("mongoose");
const MongoStore = require("connect-mongo");

require("dotenv").config(({ path: '../.env' }));

const userModel = require("./models/user");

/**
 * @const {Object} Routes
 * @description Import route handlers
 */
const userRouter = require("./routers/userRoutes");
const busRouter = require('./routers/busRouter');
const stopRouter = require('./routers/stopRouter');
const routeRouter = require('./routers/routeRouter');
const scheduleRouter = require('./routers/scheduleRouter');
const authentication = require("./middleware/authentication");
const register = require("./routers/registerRouter");
const auth = require('./routers/authRouter')
const forgotPassword = require("./routers/forgotPasswordRouter")


const path = require("path");

const app = express();

/**
 * @const {Object} app
 * @description Express application instance
 */

/**
 * @const {Array<string>} allowedOrigins
 * @description CORS configuration for allowed origins
 */
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.BACK_END_URL,
];
app.use(
  cors({
    origin: allowedOrigins, // Allow the frontend origin
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Allow these methods, including OPTIONS
    allowedHeaders: ["Content-Type", "Authorization"], // Allow headers like Content-Type and Authorization
    credentials: true, // Allow credentials (cookies/tokens) to be included
  })
);


/**
 * @middleware
 * @description Session configuration
 * @property {string} secret - Session secret key
 * @property {boolean} resave - Forces session resave
 * @property {boolean} saveUninitialized - Save uninitialized sessions
 * @property {Object} store - MongoDB session store
 * @property {Object} cookie - Session cookie settings
 */

// // Handle OPTIONS preflight request for CORS
app.options("*", (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", allowedOrigins);
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200); // Respond with 200 for preflight requests
});

app.use(
  session({
    secret: "ARandomStringThatIsHardToGuess12345",
    secret: process.env.SESSION_SECRET || "AnotherRandomStringThatIsHardToGuess12345",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      Secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    },
  })
);

/**
 * @middleware
 * @description Middleware for parsing JSON and URL-encoded form data
 */
app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: true })); // For URL-encoded form data


/**
 * @route POST /notifications
 * @description Handle real-time notifications using Pusher
 * @access Public
 * @param {Object} req.body
 * @param {string} req.body.message - Notification message
 * @param {string} req.body.recepient - Target recipient
 */
app.post("/notifications", (req, res) => {
  const { message, recepient } = req.body;
  pusher.trigger("notifications", "message", {
    message: message,
    recepient: recepient,
  });
  res.status(200).send({ message, recepient });
});

// Serve the verification file from the public folder
app.get("/loaderio-a5bdf62eb0fac010d30429b361ba4fe3", (req, res) => {
  // Path to the file in the public folder
  const filePath = path.join(
    __dirname,
    "../client/public",
    "loaderio-a5bdf62eb0fac010d30429b361ba4fe3"
  );

  // Send the file to the client
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(500).send("Error while serving the verification file.");
    }
  });
});



// app.use('/home', (req, res) => {res.send("Server is running")} );
/**
 * @routes
 * @description Register route handlers
 */
app.use("/api/register", register);
app.use("/api/auth", auth)
app.use("/api", forgotPassword);
app.use("/bus", authentication.isAuthenticated, busRouter);
app.use("/stop", authentication.isAuthenticated, stopRouter);
app.use("/route", authentication.isAuthenticated, routeRouter);
app.use("/schedule", authentication.isAuthenticated, scheduleRouter);
app.use("/user", authentication.isAuthenticated, userRouter);

// app.use((req, res) => {
//   return res.status(404).json({ message: "Not Found" });
// });
/**
 * @database
 * @description MongoDB connection
 */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));


/**
 * @route GET /auth/:busId
 * @description Verify authentication for specific bus access
 * @access Protected
 * @middleware isAuthenticated
 * @param {string} req.params.busId - Bus ID
 * @returns {Object} Authentication status and bus ID
 */
app.get("/auth/:busId", authentication.isAuthenticated, (req, res) => {
  const busId = req.params.busId;
  req.session.busId = busId;
  if (req.session.userId) {
    res.status(200).json({ authenticated: true, busId: busId });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

/**
 * @route GET /auth
 * @description Check general authentication status
 * @access Public
 * @returns {Object} Authentication details including user role and bus ID
 */
app.get("/auth", (req, res) => {
  if (req.session.userId) {
    return res.status(200).json({
      authenticated: true,
      userId: req.session.userId,
      userRole: req.session.userRole,
      busId: req.session.busId,
    });
  } else {
    return res.status(401).json({ authenticated: false });
  }
});

// if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
  });
// }

/**
 * @server
 * @description Server initialization
 * @property {number} PORT - Server port number
 * @listens {number} PORT
 * @event SIGINT - Graceful shutdown handler
 */
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// process.on("SIGINT", () => {
//   console.log("Shutting down server...");
//   server.close(() => {
//     console.log("Server closed.");
//     process.exit(0);
//   });
// });

module.exports = app;