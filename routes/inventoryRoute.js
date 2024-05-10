// Needed Resources 
const express = require("express")
const router = new express.Router()
const u = require("../utilities/")
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", u.handleErrors(invController.buildByClassificationId));

module.exports = router;  