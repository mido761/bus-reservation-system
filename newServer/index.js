import express from "express";
import cors from "cors";
import session from "express-session";
import dotenv from "dotenv";
import pool from "./db.js";
import pgSession from "connect-pg-simple";
import { reconcilePaymob } from "./cron jobs/reconcilePaymob.js";

// import fs from "fs";
// import https from "https";

// import "./cron jobs/reconcileJob.js";
import userModel from "./models/user.js";
import userRouter from "./routers/userRoutes.js";
import busRouter from "./routers/busRouter.js";
import seatRouter from "./routers/seatRouter.js";
import stopRouter from "./routers/stopRouter.js";
import routeRouter from "./routers/routeRouter.js";
import tripRouter from "./routers/tripRouter.js";
import bookingRouter from "./routers/bookingRouter.js";
import payment from "./routers/paymentRouter.js";
import authentication from "./middleware/authentication.js";
import register from "./routers/registerRouter.js";
import auth from "./routers/authRouter.js";
import forgotPassword from "./routers/forgotPasswordRouter.js";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env vars
dotenv.config({ path: "../.env" });

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
  "http://localhost:5000"
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like Postman) or valid frontend origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Preflight (OPTIONS) handler — now returns a single origin string
app.options("*", (req, res) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.sendStatus(200);
});

// Session config
const PgSessionStore = pgSession(session);

app.use(
  session({
    secret:
      process.env.SESSION_SECRET || "AnotherRandomStringThatIsHardToGuess12345",
    resave: false,
    saveUninitialized: false,
    store: new PgSessionStore({
      pool,
      tableName: "user_sessions",
    }),
    cookie: {
      httpOnly: true,
      sameSite: 'lax', // good for localhost
      secure: false, // must be false in dev
      maxAge: 24 * 60 * 60 * 1000, // 1 day
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
app.use("/api/auth", auth);
app.use("/api", forgotPassword);
// app.use("/bus", authentication.isAuthenticated, busRouter);
app.use("/bus", busRouter);
app.use("/seat", seatRouter);
// app.use("/stop", authentication.isAuthenticated, stopRouter);
app.use("/stop", stopRouter);
// app.use("/route", authentication.isAuthenticated, routeRouter);
app.use("/route", routeRouter);
// app.use("/trip", authentication.isAuthenticated, tripRouter);
app.use("/trip", tripRouter);
app.use("/booking", bookingRouter);
app.use("/user", userRouter);
app.use("/payment", payment);
// app.use((req, res) => {
//   return res.status(404).json({ message: "Not Found" });
// });
/**
 * @database
 * @description MongoDB connection
 */
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.error(err));

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
      // busId: req.session.busId,
    });
  } else {
    return res.status(401).json({ authenticated: false });
  }
});

app.get("/reconcile", async (req, res) => {
  try{
    const response = await reconcilePaymob();
    return res.status(500).json({message: response})
  }catch(err){
    return res.status(500).json({Error: "Error reconciling!", message: err.message})
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
const server = app.listen(PORT, () =>
  console.log(`Server running on port ${PORT}`)
);



// const options = {
//   key: fs.readFileSync("certs/server.key"),
//   cert: fs.readFileSync("certs/server.cert"),
// };

// https.createServer(options, app).listen(3000, () => {
//   console.log("HTTPS server running at https://localhost:3000");
// });

// process.on("SIGINT", () => {
//   console.log("Shutting down server...");
//   server.close(() => {
//     console.log("Server closed.");
//     process.exit(0);
//   });
// });

export default app;
