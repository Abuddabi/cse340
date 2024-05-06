const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  const data = await invModel.getClassifications()
  const list = `
    <ul class="menu">
      <li class="menu__item"><a href="/" title="Home page" class="menu__item-link">Home</a></li>
      ${data.map(row => `
      <li class="menu__item">
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
      <a 
        href="../../inv/detail/${vehicle.inv_id}"
        title="View ${make_and_model} details">
        <img 
          src="${vehicle.inv_thumbnail}" 
          alt="Image of ${make_and_model} on CSE Motors" 
        />
      </a>
      <div class="namePrice">
        <hr />
        <h2>
          <a 
            href="../../inv/detail/${vehicle.inv_id}"
            title="View ${make_and_model}">
            ${make_and_model}
          </a>
        </h2>
        <span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>
      </div>
    </li>`
  }

  let grid
  if (data.length > 0) {
    grid = `<ul>${data.map(vehicle => createHTML(vehicle)).join("")}</ul>`
  } else {
    grid = `<p class="notice">Sorry, no matching vehicles could be found.</p>`
  }
  return grid
}

module.exports = Util
