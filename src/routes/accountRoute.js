// Needed Resources 
const express = require("express")
const router = new express.Router()
const u = require("../utilities/")
const ctrl = require("../controllers/accountController")
const validation = require('../utilities/account-validation')

router.get("/", u.checkLogin, u.handleErrors(ctrl.buildAccount));

router.get("/getUsers", u.onlyAdmin, u.handleErrors(ctrl.getUsersJSON));
router.get("/unblock/:account_id", u.onlyAdmin, u.handleErrors(ctrl.unblockUser));
router.get("/block/:account_id", u.onlyAdmin, u.handleErrors(ctrl.blockUser));

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

router.get("/update/:account_id", u.canUpdate, u.handleErrors(ctrl.buildUpdate));
router.post("/update/:account_id",
  u.addAccountDataToReq,
  validation.updateRules(),
  validation.checkUpdateData,
  u.handleErrors(ctrl.updateAccount)
);

router.post("/update-password/:account_id",
  // u.addAccountDataToReq,
  validation.updatePasswordRules(),
  validation.checkUpdatePasswordData,
  u.handleErrors(ctrl.updatePassword)
);

module.exports = router;    