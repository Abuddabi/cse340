// Needed Resources 
const express = require("express")
const router = new express.Router()
const u = require("../utilities/")
const ctrl = require("../controllers/accountController")
const validation = require('../utilities/account-validation')

router.get("/login", u.handleErrors(ctrl.buildLogin));
// Process the login attempt
router.post(
  "/login",
  validation.loginRules(),
  validation.checkLogData,
  (req, res) => {
    res.status(200).send('login process')
  }
)

router.get("/register", u.handleErrors(ctrl.buildRegister));
router.post("/register",
  validation.registrationRules(),
  validation.checkRegData,
  u.handleErrors(ctrl.registerAccount)
);

module.exports = router;    