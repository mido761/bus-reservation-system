const express = require("express");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cors = require("cors");
const session = require('express-session');
const MonogoStore = require("connect-mongo");
const userModel = require('./models/user');
const Bus = require('./models/busModel');
require('dotenv').config();
const busRoutes = require('./routes/busRoutes');
const userRouter = require('./routes/userRoutes')
const SeatSelection = require('./routes/SeatSelection')
const contactRoutes = require('./routes/contactRoutes');


port = 3001

const app = express()
app.use(express.json())
app.use(cors({
    origin: "http://localhost:3000", // Adjust this to match your frontend URL
    credentials: true,  // Allow cookies to be sent with requests
}));

app.use(session({
    secret: "ARandomStringThatIsHardToGuess12345",
    resave: false,
    saveUninitialized: false,
    store: MonogoStore.create({mongoUrl: "mongodb://127.0.0.1:27017/bus-system"}),
    cookie: {
        httpOnly: true,
        maxAge:5000000,
    }
}))

app.use('/buses', busRoutes);
// app.use('/api', bookingRoutes);
app.use('/seatselection',SeatSelection);
app.use('/user',userRouter);


// Contact routes
app.use('/contact', contactRoutes);

//MongoDB connection 
mongoose
.connect("mongodb://127.0.0.1:27017/bus-system")
.then( ()=> console.log("MongoDB connected"))
.catch((err)=> console.error(err));

//Routes
// app.get("/api/buses", require('./routes/busRoutes'))





app.post('/login', async  (req,res)=> {
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
        req.session.userId = user._id;
        res.status(200).json("Login successful");
    } catch (err) {
        res.status(500).json("Internal server error");
    }
})

app.post('/register', async (req , res) => {
    // const {email,password} = req.body;
    // userModel.findOne({email})
    // .then(userExist => {
    //     if(userExist){
    //         res.json("email already exists")
    //     }else{ 
    //         userModel.create(req.body)
    //         .then(userNew => res.json(userNew))
    //         .catch(err => res.json(err))
    //         res.json("succsse")
    //     }
    
    // })
    // .catch(err => res.json(err))

    const { name,phoneNumber, email, password } = req.body;

    try {
        const userExist = await userModel.findOne({ email });
        if (userExist) {
            return res.json("Email already exists");
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user
        const newUser = await userModel.create({name,phoneNumber,email,password: hashedPassword});

        res.status(201).json(newUser);
        
    } catch (err) {
        res.status(500).json("Internal server error");
    }
})

app.post("/logout",(req, res) => {
    req.session.destroy(err => {
        if(err){
            return res.status(500).json("failed to logout");
        }
        res.clearCookie("connect.sid");
        res.status(200).json("logout successfuly");
    })
})

app.get("/auth/:busId" , (req,res)=>{
    const busId = req.params.busId;
    console.log("Auth Response: ", req.session)
    req.session.busId = busId
    if(req.session.userId){
        res.status(200).json({authenticated: true, "busId":busId});
    }else{
        res.status(401).json({authenticated: false})
    }
})


app.get("/auth" , (req,res)=>{
    if(req.session.userId){
        res.status(200).json({authenticated: true,"userId": req.session.userId, "busId":req.session.busId});
    }else{
        res.status(401).json({authenticated: false})
    }
})

// for profile to show the bus that are reserved
app.post("/payment",async (req,res)=>{
    // const busId = req.params.busId;
    const {userId,busId} = req.body;

    const bus = await Bus.findById(busId);
    const user = await userModel.findById(userId);

    res.status(200).json(bus)
    console.log (bus)
    if (!bus) {
      console.log (res.status(404).json({ error: "bus not found" }));
    }
    if (!user) {
        console.log (res.status(404).json({ error: "user not found" }));
      }

    const updateduser = await userModel.findByIdAndUpdate(
            userId,
            {$push:{bookedBuses:busId}},
            {new : true}
          );
    
   
})

app.listen(3001 , () =>{
    console.log("sever is running")
})