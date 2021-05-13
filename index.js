const express = require("express");
const formidable = require("express-formidable");
const mongoose = require("mongoose");
const cloudinary = require("cloudinary").v2;
const cors = require("cors");

const app = express();
app.use(formidable());
app.use(cors());

cloudinary.config({
  cloud_name: "de3pvbbkn",
  api_key: "182436473368679",
  api_secret: "LniQ34EfqQ6iYmZ49OEudtFNnEQ",
});

// Connexion BDD
mongoose.connect("mongodb://localhost/vinted-app", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
});

// import des routes
const userRoutes = require("./routes/user");
const offerRoutes = require("./routes/offer");
const paymentRoutes = require("./routes/payment");
app.use(userRoutes);
app.use(offerRoutes);
app.use(paymentRoutes);

app.all("*", (req, res) => {
  res.status(404).json({ message: "inexistant route" });
});

app.listen(3000, () => {
  console.log("server started");
});
