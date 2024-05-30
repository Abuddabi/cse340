const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const { passwordPattern } = require("../utilities/account-validation")
const jwt = require("jsonwebtoken")
require("dotenv").config()

const ctrl = {}

ctrl.buildAccount = async (req, res, next) => {
  const nav = await utilities.getNav()
  const account_type = res.locals.accountData.account_type;
  let usersManagement = "";

  if (account_type === "Admin") {
    usersManagement = utilities.getUsersManagement(res.locals.accountData.account_id);
  }

  res.render("account/account", {
    title: "Account",
    nav,
    errors: null,
    usersManagement
  })
}

ctrl.getUsersJSON = async (req, res, next) => {
  const allUsers = await accountModel.getAll();

  if (allUsers[0].account_id) {
    return res.json(allUsers);
  } else {
    next(new Error("No data returned"));
  }
}

ctrl.unblockUser = async (req, res, next) => {
  const account_id = parseInt(req.params.account_id);
  const updateResult = await accountModel.unblock(account_id);

  if (updateResult) {
    req.flash("notice", `User with id: ${account_id} was successfully unblocked!`);
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Sorry, update failed.")
    return res.status(501).redirect("/account/");
  }
}

ctrl.blockUser = async (req, res, next) => {
  const account_id = parseInt(req.params.account_id);
  const updateResult = await accountModel.block(account_id);

  if (updateResult) {
    req.flash("notice", `User with id: ${account_id} was successfully blocked!`);
    return res.redirect("/account/");
  } else {
    req.flash("notice", "Sorry, update failed.")
    return res.status(501).redirect("/account/");
  }
}

ctrl.buildLogin = async (req, res) => {
  const nav = await utilities.getNav()
  res.render("account/login", {
    title: "Login",
    nav,
    passwordPattern,
    errors: null,
  })
}

/* ****************************************
 *  Process login request
 * ************************************ */
ctrl.accountLogin = async (req, res) => {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body;
  const vars = {
    title: "Login",
    nav,
    errors: null,
    account_email,
    passwordPattern
  };
  const accountData = await accountModel.getAccountByEmail(account_email);

  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.");
    return res.status(400).render("account/login", vars);
  } else if (accountData.is_blocked) {
    req.flash("error", "Your account is blocked. Please contact Admin for further assistance.");
    return res.status(403).render("account/login", vars);
  }

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      const jwtData = utilities.getDataForJWT(accountData);
      res.cookie("jwt", jwtData.accessToken, jwtData.options);

      return res.redirect("/account/");
    } else {
      req.flash("error", "Password is incorrect.");
      return res.redirect("/account/login");
    }
  } catch (error) {
    console.error(error);
    return new Error('Access Forbidden')
  }
}

ctrl.buildRegister = async (req, res, next) => {
  const nav = await utilities.getNav()
  res.render("account/registration", {
    title: "Register",
    nav,
    passwordPattern,
    errors: null,
  })
}

/* ****************************************
*  Process Registration
* *************************************** */
ctrl.registerAccount = async (req, res) => {
  const nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body

  const regVars = {
    title: "Registration",
    nav,
    passwordPattern,
    errors: null,
  }

  // Hash the password before storing
  let hashedPassword
  try {
    // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hash(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/registration", regVars)
  }

  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash(
      "notice",
      `Congratulations, you\'re registered ${account_firstname}. Please log in.`
    )
    res.status(201).render("account/login", {
      ...regVars,
      title: "Login"
    })
  } else {
    req.flash("notice", "Sorry, the registration failed.")
    res.status(501).render("account/registration", regVars)
  }
}

ctrl.logout = async (req, res) => {
  res.clearCookie("jwt")
  return res.redirect("/")
}

ctrl.buildUpdate = async (req, res, next) => {
  const nav = await utilities.getNav()
  res.render("account/update", {
    title: `Update ${res.locals.accountData.account_firstname}`,
    nav,
    passwordPattern,
    errors: null,
    formData: null
  })
}

ctrl.updateAccount = async (req, res) => {
  const formData = req.body
  const updateResult = await accountModel.updateAccount(formData)
  const nav = await utilities.getNav()

  if (updateResult) {
    const jwtData = utilities.getDataForJWT(updateResult);
    res.cookie("jwt", jwtData.accessToken, jwtData.options);
    res.locals.accountData = { ...res.locals.accountData, ...formData }

    req.flash("notice", `${formData.account_firstname} was successfully updated.`)
  } else {
    req.flash("notice", "Sorry, update failed.")
    res.status(501)
  }

  res.render("account/update", {
    title: "Update " + formData.account_firstname,
    nav,
    errors: null,
    passwordPattern,
    formData
  })
}

ctrl.updatePassword = async (req, res) => {
  const { account_password, new_account_password, account_id } = req.body
  const accountData = await accountModel.getAccountById(account_id);

  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      // Hash the password before storing
      let hashedPassword
      try {
        // regular password and cost (salt is generated automatically)
        hashedPassword = await bcrypt.hash(new_account_password, 10)
      } catch (error) {
        req.flash("error", 'Sorry, there was an error processing the password updating.')
        return res.redirect(`/account/update/${account_id}`);
      }

      const updateResult = await accountModel.updatePassword(hashedPassword, account_id);

      if (updateResult) {
        req.flash("notice", `Password successfully updated.`);
        return res.redirect(`/account/update/${account_id}`);
      } else {
        req.flash("error", 'Sorry, there was an error processing the password updating.')
        return res.redirect(`/account/update/${account_id}`);
      }
    } else {
      req.flash("error", "Current password is incorrect.");
      return res.redirect(`/account/update/${account_id}`);
    }
  } catch (error) {
    console.error(error);
    return new Error('Access Forbidden')
  }
}

module.exports = ctrl