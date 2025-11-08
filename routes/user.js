import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userModules from "../modules/user.js";
import { authenticateToken } from "../middlewares/auth.js";
import bookingModules from "../modules/bookings.js";
import courtModules from "../modules/court.js";
const router = express.Router();
const SECRET_KEY = "asdsadasdasd213414";


router.post("/add", async (req, res) => {
  try {
    const { username, password, email, role} = req.body;

    if (!req.body) return res.status(400).send({ msg: "No Body Sent !!" });
    if (!username) return res.status(400).send({ msg: "No Username !!" });
    if (!password) return res.status(400).send({ msg: "No Password !!" });
    if (!email) return res.status(400).send({ msg: "No Email !!" });
    if (!role) return res.status(400).send({ msg: "No Role !!" });


    let user = await userModules.findOne({ email });
    if(user) return res.status(401).send({ msg: "User Already Exists !!" });

    user = new userModules({ username, password, email, role });
    await user.save();
    
    return res.status(200).send({ msg: `User Created with name ${user.username}!!` });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

// Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!req.body) return res.status(400).send({ msg: "No Body Sent !!" });
    if (!email) return res.status(400).send({ msg: "No Email !!" });
    if (!password) return res.status(400).send({ msg: "No Password !!" });

    const user = await userModules.findOne({ email });
    if (!user) return res.status(400).send({ msg: "User Not Found !!" });

    if (user.password !== password) {
      return res.status(400).send({ msg: "Incorrect Password !!" });
    }

    const token = jwt.sign(
      { id: user._id, username: user.username, email: user.email ,role:user.role,},
      SECRET_KEY,
      { expiresIn: "12h" }
    );


    res.status(200).json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

router.post("/add/booking", authenticateToken, async (req, res) => {
  const { id } = req.user;
  const { courtId, date, times } = req.body;

  if(!id) return res.status(400).send({ msg: "No User ID !!" });
  if(!courtId) return res.status(400).send({ msg: "No Court ID !!" });
  if(!date) return res.status(400).send({ msg: "No Booking Date !!" });
  if(!times || times.length === 0) return res.status(400).send({ msg: "No Booking Times !!" });

  const user = await userModules.findOne({ _id: id });;
  if (!user) return res.status(400).send({ msg: "User Not Found !!" });
  const booking = new bookingModules({ userId: id, courtId, bookingDate: date, times });
  await booking.save();
  user.bookings.push(booking._id);
  await user.save();

  // const docs = await bookingModules.find({});
  // docs.forEach(bk => console.log(bk));

  res.status(200).json(booking);

});

router.get("/bookings", authenticateToken, async (req, res) => {
  const { id } = req.user;

  if(!id) return res.status(400).send({ msg: "No User ID !!" });

  const bookings = await bookingModules.find({ userId: id });

  const data = await Promise.all(bookings.map(async (booking) => {
  const court = await courtModules.findById(booking.courtId);
  return {
    id: booking._id,
    date: booking.bookingDate,
    times: booking.times,
    court: {
      id: court._id,
      name: court.name,
      location: court.location,
      type: court.type,
      pricePerHour: court.pricePerHour,
      imagePath: court.image_path
    }
  };
}));

res.status(200).json(data);
});

router.get("/me", authenticateToken, (req, res) => {
  console.log("/me");
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  });
});



router.get("/all", async (req, res) => {
  try {
    const users = await userModules.find();
    res.status(200).send(users);
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

export default router;
