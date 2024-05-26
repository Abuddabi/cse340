// Needed Resources 
const express = require("express")
const router = new express.Router()
const u = require("../utilities/")
const ctrl = require("../controllers/accountController")
const validation = require('../utilities/account-validation')

router.get("/", u.checkLogin, u.handleErrors(ctrl.buildAccount));

router.get("/login", u.handleErrors(ctrl.buildLogin));
// Process the login attempt
router.post("/login",
  validation.loginRules(),
  validation.checkLogData,
  u.handleErrors(ctrl.accountLogin)
)

router.get("/register", u.handleErrors(ctrl.buildRegister));
router.post("/register",
  validation.registrationRules(),
  validation.checkRegData,
  u.handleErrors(ctrl.registerAccount)
);

router.get("/logout", u.handleErrors(ctrl.logout));

router.get("/update/:account_id", u.checkAuthLevel, u.handleErrors(ctrl.buildUpdate));
router.post("/update/:account_id",
  u.addAccountDataToReq,
  validation.updateRules(),
  validation.checkUpdateData,
  u.handleErrors(ctrl.updateAccount)
);

module.exports = router;    