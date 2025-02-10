const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cors = require("cors");
const session = require("express-session");
const MonogoStore = require("connect-mongo");
const userModel = require("./models/user");
const Bus = require("./models/busModel");
require("dotenv").config();
const busRoutes = require("./routes/busRoutes");
const userRouter = require("./routes/userRoutes");
const SeatSelection = require("./routes/SeatSelection");
const contactRoutes = require("./routes/contactRoutes");
const register = require("./routes/register");
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

// Middleware for parsing JSON and URL-encoded form data
app.use(express.json()); // For JSON payloads
app.use(express.urlencoded({ extended: true })); // For URL-encoded form data

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5000",
  "http://192.168.0.108:5000",
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
    const {message, recepient} = req.body;
    pusher.trigger("notifications", "message", {
        message: message,
        recepient: recepient,
    });
    res.status(200).send({message, recepient});  
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
app.use("/buses", busRoutes);
// app.use('/api', bookingRoutes);
app.use("/seatselection", SeatSelection);
app.use("/user", userRouter);

// Email verifaction
app.use("/api/register", register);

// Contact routes
app.use("/contact", contactRoutes);

//MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error(err));

//Routes
// app.get("/api/buses", require('./routes/busRoutes'))

app.post("/api/login", async (req, res) => {
  // const {email,password} = req.body;
  // userModel.findOne({email:email})
  // .then(user => {
  //     if (!user){
  //         return res.status(404).json("This email does not exist");
  //     }
  //     const isPasswordValid = bcrypt.compare(password, user.password);
  //     if(!isPasswordValid){
  //         return res.status(401).json("The password is incorrect");
  //     }
  //     req.session.userId =user._id;
  //     res.status(200).json("login successful");
  // })
  // .catch (err => res.status(500).json("Internal server error"))
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

    // Set session ID
    console.log(req.session);
    req.session.userId = user._id;
    console.log(req.session);
    res.status(200).json("Login successful");
  } catch (err) {
    res.status(500).json("Internal server error");
  }
});

// app.post('/api/register', async (req , res) => {
//     // const {email,password} = req.body;
//     // userModel.findOne({email})
//     // .then(userExist => {
//     //     if(userExist){
//     //         res.json("email already exists")
//     //     }else{
//     //         userModel.create(req.body)
//     //         .then(userNew => res.json(userNew))
//     //         .catch(err => res.json(err))
//     //         res.json("succsse")
//     //     }

//     // })
//     // .catch(err => res.json(err))

//     const { name,phoneNumber, email, password } = req.body;

//     try {
//         const userExist = await userModel.findOne({ email });
//         if (userExist) {
//             return res.json("Email already exists");
//         }

//         // Hash the password before saving
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create new user
//         const newUser = await userModel.create({name,phoneNumber,email,password: hashedPassword});

//         res.status(201).json(newUser);

//     } catch (err) {
//         res.status(500).json("Internal server error");
//     }
// })

app.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json("failed to logout");
    }
    res.clearCookie("connect.sid");
    res.status(200).json("logout successfuly");
  });
});

app.get("/auth/:busId", (req, res) => {
  const busId = req.params.busId;
  console.log("Auth Response: ", req.session);
  req.session.busId = busId;
  if (req.session.userId) {
    res.status(200).json({ authenticated: true, busId: busId });
  } else {
    res.status(401).json({ authenticated: false });
  }
});

app.get("/auth", (req, res) => {
  console.log(req.session);
  if (req.session.userId) {
    res.status(200).json({
      authenticated: true,
      userId: req.session.userId,
      busId: req.session.busId,
    });
  } else {
    console.log(req.session);
    res.status(401).json({ authenticated: false });
  }
});

// for profile to show the bus that are reserved
app.post("/payment", async (req, res) => {
  // const busId = req.params.busId;
  const { userId, busId } = req.body;

  const bus = await Bus.findById(busId);
  const user = await userModel.findById(userId);

  res.status(200).json(bus);
  console.log(bus);
  if (!bus) {
    console.log(res.status(404).json({ error: "bus not found" }));
  }
  if (!user) {
    console.log(res.status(404).json({ error: "user not found" }));
  }

  const updateduser = await userModel.findByIdAndUpdate(
    userId,
    { $push: { bookedBuses: busId } },
    { new: true }
  );
});

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../client/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname, "../client/dist/index.html"));
  });
  console.log(process.env.NODE_ENV);
}

app.listen(process.env.PORT || 5000, () => {
  console.log("sever is running");
});

module.exports = app;
