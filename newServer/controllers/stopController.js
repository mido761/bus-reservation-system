const Stop = require("../models/stop");

const getStops = async (req, res) => {
  try {
    const stops = await Stop.find();

    return res.status(200).json(stops);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
const addStop = async (req, res) => {
  const {stopName,location} = req.body;
  try{
    stopNameIndata = await Stop.find({stopName:stopName});
    console.log(stopNameIndata)
    if (stopNameIndata.length>0){
      return res
        .status(400)
        .json("this Stop Name Aleardy exist!!");
    };

    const newStop = new Stop({
      stopName:stopName,
      location:location,
    })

    await newStop.save();
    return res.status(200).json("Stop added successfully!");
  }catch(error){
    return res.status(500).json({ message: error.message });
  }
};
const editStop = async (req, res) => {
//dont know
};

const delStop = async (req, res) => {
//dont know
};

module.exports = { getStops, addStop,editStop,delStop};
