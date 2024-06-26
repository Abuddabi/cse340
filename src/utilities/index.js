const invModel = require("../models/inventory-model")
const accountModel = require("../models/account-model")
const jwt = require("jsonwebtoken")
require("dotenv").config()
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (active = null) {
  const classifications = await invModel.getClassifications()
  const list = `
    <ul class="menu">
      <li class="menu__item ${active === "/" ? "active" : ""}"><a href="/" title="Home page" class="menu__item-link">Home</a></li>
      ${classifications.map(row => `
      <li class="menu__item ${active == row.classification_id ? "active" : ""}">
        <a 
          class="menu__item-link"
          href="/inv/type/${row.classification_id}" 
          title="See our inventory of ${row.classification_name} vehicles">
          ${row.classification_name}
        </a>
      </li>`).join("")}
    </ul>
  `
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
Util.buildClassificationGrid = async function (data) {
  const createHTML = (vehicle) => {
    const make_and_model = `${vehicle.inv_make} ${vehicle.inv_model}`
    return `
    <li>
      <div class="inv-link-container">
        <div class="inv-img-container">
          <img src="${vehicle.inv_thumbnail}" alt="Image of ${make_and_model} on CSE Motors">
        </div>
        <hr>
        <h2 class="inv-title">${make_and_model}</h2>
        <span class="inv-price">$${this.formatNumber(vehicle.inv_price)}</span>
        <a class="inv-link" href="/inv/detail/${vehicle.inv_id}"></a>
      </div>
    </li>
    `
  }

  let grid
  if (data[0].inv_id === null) {
    grid = `<p class="notice">Sorry, no vehicles could be found in this classification.</p>`
  } else {
    grid = `<ul id="inv-display">${data.map(vehicle => createHTML(vehicle)).join("")}</ul>`
  }
  return grid
}

Util.buildDetailPage = async function (data) {
  const noImage = "/images/vehicles/no-image.png"
  const thumbnail = data.inv_thumbnail || noImage
  const image = data.inv_image || noImage
  const makeAndModel = data.inv_make + " " + data.inv_model
  const attributes = {
    "Make": data.inv_make,
    "Model": data.inv_model,
    "Year": data.inv_year,
    "Price": data.inv_price,
    "Mileage": data.inv_miles,
    "Color": data.inv_color,
    "Description": data.inv_description,
  }
  const attributeList = Object.keys(attributes).map(key => {
    let content = attributes[key] || ""
    if (attributes[key]) {
      if (key === "Price") {
        content = `$${this.formatNumber(attributes[key])}`
      } else if (key === "Mileage ") {
        content = this.formatNumber(attributes[key])
      }
    }

    return `
    <li class="vehicle__info"><span class="bold">${key}: </span>${content}</li>`
  }).join("")

  return `
    <div class="vehicle">
      <div class="vehicle__container">
      
        <!--<div class="vehicle__column vehicle__column_thumbnails">
          <div class="vehicle__thumbnails-container">
            <img class="vehicle__thumbnail" src="${thumbnail}" alt="${makeAndModel} - Thumbnail">
          </div>
        </div>-->

        <div class="vehicle__column vehicle__column_main-full">
          <img src="${image}" alt="${makeAndModel}">
        </div>
        <div class="vehicle__column vehicle__column_text">
          <ul class="vehicle__info-list">
            ${attributeList}
            <li class="vehicle__info">
              <span class="bold">VIN: </span>
              <span>
                <button class="vehicle__vin-btn" id="js-vin-btn">Reveal the VIN number</button>
              </span>
            </li>
          </ul>
        </div>
      </div>
    </div>
    `
}

Util.buildClassificationList = async function (active_id = null) {
  const classifications = await invModel.getClassifications()
  return `
  <select name="classification_id" id="classificationList" required>
    <option value="">Choose a Classification</option>
    ${classifications.map(row => {
    const selected = active_id !== null && row.classification_id == active_id ? "selected" : ""
    return `
    <option value="${row.classification_id}" ${selected}>${row.classification_name}</option>
    `}).join("")}
  </select>`
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch((err) => next(err))

Util.formatNumber = number => new Intl.NumberFormat('en-US').format(number)

Util.ifExists = value => typeof value !== 'undefined' ? value : ''

/* ****************************************
* Middleware to check token validity
**************************************** */
Util.checkJWTToken = (req, res, next) => {
  if (req.cookies.jwt) {
    jwt.verify(
      req.cookies.jwt,
      process.env.ACCESS_TOKEN_SECRET,
      (err, accountData) => {
        if (err) {
          req.flash("notice", "Please log in")
          res.clearCookie("jwt")
          return res.redirect("/account/login")
        }
        res.locals.accountData = accountData
        res.locals.loggedin = 1
        next()
      })
  } else {
    next()
  }
}

Util.checkAuthLevel = (req, res, next) => {
  if (!res.locals.loggedin) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }

  const accountType = res.locals.accountData.account_type;

  if (accountType === "Admin" || accountType === "Employee") {
    next();
  } else {
    req.flash("notice",
      `Your account has type ${accountType}. 
      You don't have access to ${req.originalUrl}. Ask Admin to give you rights for that.`);
    res.redirect(req.header('Referer') || '/');
  }
}

Util.canUpdate = (req, res, next) => {
  if (!res.locals.loggedin) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }

  const accountType = res.locals.accountData.account_type;
  const sameAccount = Number(req.params.account_id) === res.locals.accountData.account_id;

  if (sameAccount || accountType === "Admin") {
    next();
  } else if (!sameAccount) {
    req.flash("notice",
      `Access denied. You can not edit other user's accounts.`);
    res.redirect(req.header('Referer') || '/');
  } else {
    req.flash("notice",
      `Your account has type ${accountType}. 
      You don't have access to ${req.originalUrl}. Ask Admin to give you rights for that.`);
    res.redirect(req.header('Referer') || '/');
  }
}

Util.onlyAdmin = (req, res, next) => {
  if (!res.locals.loggedin) {
    req.flash("notice", "Please log in.");
    return res.redirect("/account/login");
  }

  if (res.locals.accountData.account_type === "Admin") {
    next();
  } else {
    req.flash("notice", `Access Denied`);
    res.redirect(req.header('Referer') || '/');
  }
}

/* ****************************************
 *  Check Login
 * ************************************ */
Util.checkLogin = (req, res, next) => {
  // console.log(res.locals.accountData);
  if (res.locals.loggedin) {
    next()
  } else {
    req.flash("notice", "Please log in.")
    return res.redirect("/account/login")
  }
}

Util.addAccountDataToReq = (req, res, next) => {
  if (res.locals.accountData) {
    req.accountData = res.locals.accountData;
  }
  next();
}

Util.getDataForJWT = (accountData) => {
  delete accountData.account_password
  const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 }) // in seconds
  const options = { httpOnly: true, maxAge: 3600 * 1000 } // in milliseconds
  if (process.env.NODE_ENV !== 'development') options.secure = true // https only

  return { accessToken, options };
}

Util.getUsersManagement = async (admin_id) => {
  const users = await accountModel.getAll();

  return `
  
  `;
}

module.exports = Util
