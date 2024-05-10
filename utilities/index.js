const invModel = require("../models/inventory-model")
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
        <span class="inv-price">$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
        <a class="inv-link" href="../../inv/detail/${vehicle.inv_id}"></a>
      </div>
    </li>
    `
  }

  let grid
  if (data.length > 0) {
    grid = `<ul id="inv-display">${data.map(vehicle => createHTML(vehicle)).join("")}</ul>`
  } else {
    grid = `<p class="notice">Sorry, no matching vehicles could be found.</p>`
  }
  return grid
}

/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)

module.exports = Util
