const Route = require("../models/route");
const Stop = require("../models/stop");

const getRoutes = async (req, res) => {
  try {
    const routes = await Route.find();

    return res.status(200).json(routes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

const addRoutes = async (req, res) => {
    const{source,destination,distance,estimatedDuration,stops,isActive} = req.body;
    try{
        if(!(source&&destination&&distance&&estimatedDuration&&stops)){
            return res
            .status(400)
            .json("You should fill source & destination & distance & estimatedDuration & stops!");
        }
        const newRoute = new Route({
            source:source,
            destination:destination,
            distance:distance,
            estimatedDuration:estimatedDuration,
            stops:stops,
            isActive:isActive
        }); 
        await newRoute.save();
        
        return res.status(200).json("Route added successfully!");

    }catch(error){
        return res.status(500).json({ message: error.message });
    }
}

const editRoutes = (req, res) => {

}

const delRoutes = (req, res) => {

}

module.exports = {getRoutes,addRoutes,editRoutes,delRoutes}

