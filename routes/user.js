import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import userModules from "../modules/user.js";
import { authenticateToken } from "../middlewares/auth.js";

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
      { id: user.id, username: user.username, email: user.email },
      SECRET_KEY,
      { expiresIn: "12h" }
    );


    res.status(200).json({ token });

  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
});

router.get("/me", authenticateToken, (req, res) => {
  res.json({
    id: req.user.id,
    username: req.user.username,
    email: req.user.email,
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
