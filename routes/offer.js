const express = require("express");
const router = express.Router();
const cloudinary = require("cloudinary").v2;
const User = require("../models/User");
const Offer = require("../models/Offer");
const isAuthenticated = require("../middlewares/isAuthenticated");

router.post("/offer/publish", isAuthenticated, async (req, res) => {
  try {
    if (req.fields.name && req.fields.price && req.files.picture.path) {
      const newOffer = new Offer({
        product_name: req.fields.name,
        product_description: req.fields.description,
        product_price: req.fields.price,
        product_details: [
          {
            MARQUE: req.fields.brand,
          },
          {
            TAILLE: req.fields.size,
          },
          {
            ETAT: req.fields.condition,
          },
          {
            COULEUR: req.fields.color,
          },
          {
            EMPLACEMENT: req.fields.city,
          },
        ],
        owner: req.user,
      });

      let pictureToUpload = req.files.picture.path;

      const result = await cloudinary.uploader.upload(pictureToUpload, {
        folder: `/cassiopeia-vinted/offer/${newOffer._id}`,
      });

      newOffer.product_image = result;
      await newOffer.save();
      res.status(200).json(newOffer);
    } else {
      res.status(400).json({
        message: "Les champs titre, prix, photo doivent être remplis",
      });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offers", async (req, res) => {
  try {
    let filters = {};
    if (req.query.title) {
      filters.product_name = new RegExp(req.query.title, "i");
    }

    if (req.query.priceMin) {
      filters.product_price = { $gte: Number(req.query.priceMin) }; // greater than or equal
    }

    if (req.query.priceMax) {
      if (filters.product_price) {
        filters.product_price.$lte = Number(req.query.priceMax);
      } else {
        filters.product_price = { $lte: Number(req.query.priceMax) }; // lower than or equal
      }
    }

    let sort = {};

    if (req.query.sort === "price-desc") {
      sort.product_price = -1; // "desc"
    } else if (req.query.sort === "price-asc") {
      sort.product_price = 1; // "asc"
    }

    // req.query.page
    const limit = Number(req.query.limit);
    let page;
    if (Number(req.query.page) > 0) {
      page = (Number(req.query.page) - 1) * limit;
    } else {
      page = 0;
    }

    const results = await Offer.find(filters)
      .sort(sort)
      .populate("owner", "account")
      .skip(page)
      .limit(limit);

    const count = await Offer.countDocuments(filters);

    res.status(200).json({
      count: count,
      results: results,
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get("/offer/:_id", async (req, res) => {
  try {
    const result = await Offer.findById(req.params).populate(
      "owner",
      "account"
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

module.exports = router;
