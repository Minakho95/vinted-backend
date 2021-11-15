const express = require("express");
const uid2 = require("uid2");
const SHA256 = require("crypto-js/sha256");
const encBase64 = require("crypto-js/enc-base64");
const router = express.Router();

const User = require("../models/User");

router.post("/user/signup", async (req, res) => {
  try {
    const emailDatabase = await User.findOne({ email: req.fields.email });

    // Si l'user n'existe pas
    if (!emailDatabase) {
      // Si les champs sont bien remplis
      if (req.fields.password && req.fields.email && req.fields.username) {
        // encrypter le mdp
        const password = req.fields.password;
        const salt = uid2(16);
        const hash = SHA256(salt + password).toString(encBase64);
        const token = uid2(16);

        // créer le nouvel utilisateur
        const newUser = new User({
          token: token,
          hash: hash,
          salt: salt,
          email: req.fields.email,
          account: {
            username: req.fields.username,
          },
        });
        console.log(req.fields.email);

        await newUser.save();
        res.status(200).json({
          _id: newUser._id,
          email: newUser.email,
          token: newUser.token,
          account: newUser.account,
        });
        console.log(newUser);
      } else {
        res.status(400).json("Aucun champs n'est rempli");
      }
    } else {
      res.status(400).json("email déjà existant");
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.post("/user/login", async (req, res) => {
  try {
    const { email, password } = req.fields;
    const user = await User.findOne({ email: email });
    if (email && password) {
      // Si l'utilisateur existe dans la bdd
      if (user) {
        const newHash = SHA256(user.salt + password).toString(encBase64);
        // Est ce que l'utilisateur a rentré le bon mdp ?
        if (newHash === user.hash) {
          res.status(200).json({
            _id: user._id,
            token: user.token,
            account: user.account,
          });
        } else {
          res.status(401).json({ message: "Connexion non autorisée" });
        }
      } else {
        res.status(401).json({ message: "Utilisateur non trouvé" });
      }
    } else {
      res.status(401).json({ message: "Aucun champs n'est rempli" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
