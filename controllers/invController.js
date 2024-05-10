const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invController = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const isNumber = /^[0-9]+$/.test(classification_id)

  if (!isNumber) {
    const errorText = "Wrong classification id in the URL. Should be a number."
    console.error("invController: ", errorText)
    const newError = new Error(errorText)
    newError.code = 400
    newError.status = "400 Bad request"
    throw newError
  }
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav(classification_id)
  const className = data[0].classification_name

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}

module.exports = invController