// Needed Resources 
const express = require("express")
const router = new express.Router()
const u = require("../utilities/")
const ctrl = require("../controllers/accountController")
const regValidate = require('../utilities/account-validation')

router.get("/login", u.handleErrors(ctrl.buildLogin));
router.get("/register", u.handleErrors(ctrl.buildRegister));
router.post("/register",
  regValidate.registrationRules(),
  regValidate.checkRegData,
  u.handleErrors(ctrl.registerAccount)
);

module.exports = router;  