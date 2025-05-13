const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const MonogoStore = require("connect-mongo");
const userModel = require("./models/user");
const Bus = require("./models/busModel");
// const BusForm = require("../models/busForm");
require("dotenv").config();
const busRoutes = require("./routes/busRoutes");
const userRouter = require("./routes/userRoutes");
const SeatSelection = require("./routes/SeatSelection");
const FormSelection = require("./routes/FormSelection");
const FormSeats = require("./routes/seats");
const contactRoutes = require("./routes/contactRoutes");
const middleware = require("./controllers/middleware");
const register = require("./routes/register");
const forgotPassword = require("./routes/forgotPassword")
const blackList = require("./routes/blackList");
const driverList = require("./routes/driverList");
const path = require("path");
// For email vraification
const nodemailer = require("nodemailer");

const Pusher = require("pusher");

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});

const app = express();


const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://192.168.0.130:5173",
  "http://192.168.0.130:5000",
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


// Middleware for parsing JSON and URL-encoded form data
app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: true })); // For URL-encoded form data

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
    store: MonogoStore.create({ mongoUrl: process.env.MONGO_URI }),
    cookie: {
      httpOnly: true,
      sameSite: "strict",
      Secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 1 day expiration
    },
  })
);

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
app.use("/buses", middleware.isAuthenticated, busRoutes);
app.use("/driver-list", driverList);
// app.use('/api', bookingRoutes);
app.use("/seatselection", middleware.isAuthenticated,  SeatSelection);
app.use("/formselection", middleware.isAuthenticated,  FormSelection);
app.use("/seats", middleware.isAuthenticated,  FormSeats);
app.use("/user", middleware.isAuthenticated, userRouter);
app.use("/blacklist", middleware.isAuthoraized, blackList);

// Email verifaction
app.use("/api/register", register);

app.use("/api", forgotPassword);
// Contact routes
app.use("/contact", middleware.isAuthenticated, contactRoutes);

//MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

//Routes
// app.get("/api/buses", require('./routes/busRoutes'))

app.post("/api/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.status(404).json("This email does not exist");
    }

    // Check password validity
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json("The password is incorrect");
    }

    // Regenerate session to prevent session fixation
    req.session.regenerate((err) => {
      if (err) {
        return res.status(500).json("Session error");
      }

      // Set new session values
      req.session.userId = user._id;
      req.session.userRole = user.role;

      res.status(200).json("Login successful");
    });
  } catch (err) {
    res.status(500).json("Internal server error");
  }
});


app.post("/logout", middleware.isAuthenticated, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json("failed to logout");
    }
    res.clearCookie("connect.sid");
    res.status(200).json("logout successfuly");
  });
});

app.get("/auth/:busId", middleware.isAuthenticated, (req, res) => {
  const busId = req.params.busId;
  req.session.busId = busId;
  if (req.session.userId) {
    res.status(200).json({ authenticated: true, busId: busId });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

app.get("/auth", (req, res) => {
  if (req.session.userId) {
    res.status(200).json({
      authenticated: true,
      userId: req.session.userId,
      userRole: req.session.userRole,
      busId: req.session.busId,
    });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

// for profile to show the bus that are reserved
app.post("/payment", middleware.isAuthenticated, async (req, res) => {
  // const busId = req.params.busId;
  const { userId, busId } = req.body;

  const bus = await Bus.findById(busId);
  const user = await userModel.findById(userId);

  res.status(200).json(bus);
  if (!bus) {
    res.status(404).json({ error: "bus not found" });
  }
  if (!user) {
    res.status(404).json({ error: "user not found" });
  }

  const updateduser = await userModel.findByIdAndUpdate(
    userId,
    { $push: { bookedBuses: busId } },
    { new: true }
  );
});

// if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
  });
// }

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

process.on("SIGINT", () => {
  console.log("Shutting down server...");
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
});

module.exports = app;
