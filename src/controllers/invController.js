const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invController = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invController.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const isNumber = /^[0-9]+$/.test(classification_id)
  if (!isNumber) throw generateError("Wrong classification id in the URL. Should be a number.")

  const data = await invModel.getInventoryByClassificationId(classification_id)
  if (data.length === 0) throw generateError("Wrong URL. Check the classification id.", 404)

  const grid = await utilities.buildClassificationGrid(data)
  const nav = await utilities.getNav(classification_id)
  const className = data[0].classification_name

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
  })
}

invController.buildByItemId = async function (req, res, next) {
  const item_id = req.params.itemId
  const isNumber = /^[0-9]+$/.test(item_id)
  if (!isNumber) throw generateError("Wrong Item id in the URL. Should be a number.")

  const data = await invModel.getItemById(item_id)
  if (!data) throw generateError("Wrong URL. Check the item id.", 404)

  const nav = await utilities.getNav(data.classification_id)
  const detail = await utilities.buildDetailPage(data)

  res.render("./inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    detail,
    errors: null,
  })
}

function generateError(errorText, code = 400) {
  const statusText = code == 400 ? "Bad request" : code == 404 ? "Not found" : ""
  const newError = new Error(errorText)
  newError.code = code
  newError.status = code + " " + statusText

  return newError
}

module.exports = invController