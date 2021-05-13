const User = require("../models/User");

const isAuthenticated = async (req, res, next) => {
  try {
    if (req.headers.authorization) {
      // on recupere le token
      const token = req.headers.authorization.replace("Bearer ", "");
      // cherche le user qui possede le token dans la bdd
      const user = await User.findOne({ token: token }).select("account _id");

      if (user) {
        req.user = user;
        next();
      } else {
        res.status(401).json({ message: "Unauthorized" });
      }
    } else {
      res.status(401).json({ message: "Unauthorized" });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
  console.log("on entre dans le middleware");
};

module.exports = isAuthenticated;
