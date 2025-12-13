import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userModules from "../modules/user.js";
import { authenticateToken } from "../middlewares/auth.js";
import { validate } from "../middlewares/validator.js";
import bookingModules from "../modules/bookings.js";
import courtModules from "../modules/court.js";
import { asyncHandler } from "../middlewares/errorHandler.js";
import { userValidation } from "../validation/user.validation.js";
import { bookingValidation } from "../validation/booking.validation.js";

const router = express.Router();
const SECRET_KEY = "asdsadasdasd213414";


router.post("/add", validate(userValidation), asyncHandler(async (req, res) => {
    const { username, password, email, role} = req.body;
    if (!req.body) return res.status(400).send({ msg: "No Body Sent !!" });
    let user = await userModules.findOne({ email });
    if(user) return res.status(401).send({ msg: "User Already Exists !!" });

    user = new userModules({ username, password, email, role });
    await user.save();
    
    return res.status(200).send({ msg: `User Created with name ${user.username}!!` });
}));

// Login Route
router.post("/login", asyncHandler(async (req, res) => {
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

}));

router.post("/add/booking",validate(bookingValidation), authenticateToken, asyncHandler(async (req, res) => {
  const { id } = req.user;
  const { courtId, date, times } = req.body;

  // if(!id) return res.status(400).send({ msg: "No User ID !!" });
  // if(!courtId) return res.status(400).send({ msg: "No Court ID !!" });
  // if(!date) return res.status(400).send({ msg: "No Booking Date !!" });
  // if(!times || times.length === 0) return res.status(400).send({ msg: "No Booking Times !!" });

  const user = await userModules.findOne({ _id: id });;
  if (!user) return res.status(400).send({ msg: "User Not Found !!" });
  const booking = await bookingModules.create({ userId: id, courtId, bookingDate: date, times });
  await booking.save();
  user.bookings.push(booking._id);
  await user.save();

  // const docs = await bookingModules.find({});
  // docs.forEach(bk => console.log(bk));

  res.status(200).json(booking);

}));

router.get("/bookings", authenticateToken, asyncHandler(async (req, res) => {
    const { id } = req.user;
    if (!id) return res.status(400).send({ msg: "No User ID !!" });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalBookings = await bookingModules.countDocuments({ userId: id });

    const bookings = await bookingModules.find({ userId: id })
      .skip(skip)
      .limit(limit);

    const data = await Promise.all(bookings.map(async (bk) => {
      const court = await courtModules.findById(bk.courtId);
      return {
        bookingId: bk._id,
        date: bk.bookingDate,
        times: bk.times,
        court: court ? {
          id: court._id,
          name: court.name,
          location: court.location,
          type: court.type,
          pricePerHour: court.pricePerHour,
          imagePath: court.image_path
        } : null
      };
    }));

    res.status(200).json({
      page,
      limit,
      total: totalBookings,
      totalPages: Math.ceil(totalBookings / limit),
      data
    });

}));


router.get("/me", authenticateToken, (req, res) => {
  console.log("/me");
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
    role: req.user.role,
  });
});

router.get("/all", asyncHandler(async (req, res) => {
  const users = await userModules.find();
  res.status(200).send(users);
}));

export default router;
