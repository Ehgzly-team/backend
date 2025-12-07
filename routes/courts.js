import express from "express";
import courtModules from "../modules/court.js";
import userModules from "../modules/user.js";
import { authenticateToken } from "../middlewares/auth.js";
import { validate } from "../middlewares/validator.js";
import bookingModules from "../modules/bookings.js";
import { courtValidation } from "../validation/courts.validation.js";

const router = express.Router();

router.get("/pagination", async (req, res) => {
  try {
    const query = {};
    if (req.query.type != "all") {
      query.type = req.query.type;
    }
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const subName = req.query.subName;
    if(subName.trim){
      query.name={$regex:subName ,$options:"i"}
    }
    const skip = (page - 1) * limit;
    const courts = await courtModules.find(query).sort({ _id: -1 }).skip(skip).limit(limit);
    res.status(200).json({ data: courts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});
router.get("/pagination/mycourts", authenticateToken, async (req, res) => {
  try {
    const user = await userModules.findOne({ _id: req.user.id });
    const query = { _id: { $in: user.owned_courts } };
    const { page = 1, limit = 10, type = "all" } = req.body;
    if (type != "all") {
      query.type = type;
    }
    const total = await courtModules.countDocuments(query);
    if (total) {
      const skip = (page - 1) * limit;
      const courts = await courtModules.find(query).skip(skip).limit(limit);
      res.status(200).json({ data: courts });
    } else {
      res.status(200).json({ data: [] });
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.get("/pagination/fav", authenticateToken, async (req, res) => {
  try {
    const user = await userModules.findOne({ _id: req.user.id });
    const query = { _id: { $in: user.favorites } };
    const { page = 1, limit = 10, type = "all" } = req.body;
    if (type != "all") {
      query.type = type;
    }
    const total = await courtModules.countDocuments(query);
      const skip = (page - 1) * limit;
      const courts = await courtModules.find(query).skip(skip).limit(limit);
      console.log(courts);
      res.status(200).json({ data: courts });
  } catch (err) {
    console.error(err);
    res.status(500).send("Internal Server Error");
  }
});

router.put("/toggle/fav", authenticateToken, async (req, res) => {
  try {
    const user = await userModules.findOne({ _id: req.user.id });
    const { courtId } = req.body;
    if(user.favorites.includes(courtId)){
      user.favorites= user.favorites.filter(((cid)=>cid!=courtId))
    }else{
      user.favorites.push(courtId);
    }
    const result = await userModules.updateOne(
      { _id: req.user.id }, // Filter
      { $set: { favorites :user.favorites } }               // Update data
    );
    res.status(200).json({msg:"toggled successfully"})
  } catch (err) {
    console.error(err); 
    res.status(500).send("Internal Server Error");
  }
});

router.get("/isFav",authenticateToken,async (req,res)=>{
  try{
  const user = await userModules.findOne({ _id: req.user.id });
    const { courtId } = req.query;
    console.log(courtId);
    let isfav;
    if(user.favorites.includes(courtId)){
      isfav=true;
    }else{
      isfav=false
    }
    console.log(isfav);
    res.status(200).json(isfav);
  }catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }

})

router.get("/times/:courtId", authenticateToken, async (req, res) => {
  try {
    const { courtId } = req.params;
    const { date } = req.query;
    if (!courtId) return res.status(400).send({ msg: "No Court ID !!" });
    if (!date) return res.status(400).send({ msg: "No Booking Date !!" });

    // Convert date string to Date object for comparison
    const bookingDate = new Date(date);
    bookingDate.setHours(0, 0, 0, 0); // Set time to start of day
    
    // Find all bookings for this court on the specified date
    const bookings = await bookingModules.find({
      courtId: courtId,
      bookingDate: {
        $gte: bookingDate,
        $lt: new Date(bookingDate.getTime() + 24 * 60 * 60 * 1000) // Next day
      }
    });

    console.log("Testing backend")

    // Extract all booked time slots
    const bookedTimes = bookings.reduce((times, booking) => {
      return times.concat(booking.times);
    }, []);

    res.status(200).json({ bookedTimes }["bookedTimes"]);

  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

router.post("/add",validate(courtValidation), authenticateToken, async (req,res)=>{
try{
  let owner=req.user.id;
 const {name,location,type,pricePerHour,image_path} = req.body;
//  if (!name || !location || !type || !pricePerHour || !owner || !image_path) {
//     return res.status(400).send({ msg: "Bad Request" });
//   }
 let court= new courtModules({name,location,type,pricePerHour,owner,image_path})
 await court.save()
 let user= await userModules.findOne({ _id: owner });
 user.owned_courts.push(court._id);
 await user.save();
 return res.status(200).send({ msg: `Court Created with name ${court.name}!!` });
}catch(err){
  console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
}
});


export default router;