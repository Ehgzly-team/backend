import express from "express";
import userModules from "../modules/user.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!req.body) return res.status(400).send({ msg: "No Body Sent !!" });
    if (!username) return res.status(400).send({ msg: "No Username !!" });
    if (!password) return res.status(400).send({ msg: "No Password !!" });

    const user = await userModules.create({ username, password });
    return res.status(200).send({ msg: `User Created with name ${user.username}!!` });
  } catch (err) {
    console.error(err);
    res.status(500).send({ msg: "Internal Server Error" });
  }
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
