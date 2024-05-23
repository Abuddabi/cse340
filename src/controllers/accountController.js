const utilities = require("../utilities/")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const { passwordPattern } = require("../utilities/account-validation")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const ctrl = {}

ctrl.buildAccount = async (req, res, next) => {
  const nav = await utilities.getNav()
  res.render("account/account", {
    title: "Account",
    nav,
    errors: null,
  })
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
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
      passwordPattern
    })
    return
  }
  try {
    if (await bcrypt.compare(account_password, accountData.account_password)) {
      delete accountData.account_password
      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 }) // in seconds
      const options = { httpOnly: true, maxAge: 3600 * 1000 } // in milliseconds
      if (process.env.NODE_ENV !== 'development') options.secure = true // https only

      res.cookie("jwt", accessToken, options)
      return res.redirect("/account/")
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

module.exports = ctrl