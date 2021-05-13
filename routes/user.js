const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const password = req.fields.password;
    const salt = uid2(16);
    const hash = SHA256(salt + password).toString(encBase64);
    const token = uid2(16);

    const newUser = new User({
      token: token,
      hash: hash,
      salt: salt,
      email: req.fields.email,
      account: {
        username: req.fields.username,
      },
    });
    const emailDatabase = await User.findOne({ email: req.fields.email });
    console.log(req.fields.email);
    console.log(emailDatabase);
    if (!emailDatabase || req.fields.username) {
      await newUser.save();
      res.status(200).json("email ok");
    } else {
      res.status(400).json("email already exist or username not filled");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const user = await User.findOne({ email: email });
    if (user) {
      const newHash = SHA256(user.salt + password).toString(encBase64);
      if (newHash === user.hash) {
        res.status(200).json({
          _id: user._id,
          token: user.token,
          account: user.account,
        });
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
