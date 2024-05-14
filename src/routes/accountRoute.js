// Needed Resources 
const express = require("express")
const router = new express.Router()
const u = require("../utilities/")
const { buildLogin, buildRegister } = require("../controllers/accountController")

router.get("/login", u.handleErrors(buildLogin));
router.get("/register", u.handleErrors(buildRegister));

module.exports = router;  