const express = require("express");
const router = express.Router();
const stripe = require("stripe")(
  "sk_test_51IqN4QKPhXEwP51Ag3HINbWR0d1mws40wkU347R4ZUbNFt9VudVCkSklqnNGoCy1SxJsJ6ygzG8UekTDYHBT7ozV00XDlk2EpA"
);

router.post("/payment", async (req, res) => {
  try {
    // Créer la transaction
    const response = await stripe.charges.create({
      amount: req.fields.amount * 100,
      currency: "eur",
      description: `Paiement vinted pour : ${req.fields.title}`,
      source: req.fields.token,
    });
    res.json(response);
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ error: error.message });
  }
});
module.exports = router;
