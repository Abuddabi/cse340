// Needed Resources 
const express = require("express")
const router = new express.Router()
const u = require("../utilities/")
const { buildLogin, buildRegister, registerAccount } = require("../controllers/accountController")

router.get("/login", u.handleErrors(buildLogin));
router.get("/register", u.handleErrors(buildRegister));
router.post("/register", u.handleErrors(registerAccount));

module.exports = router;  