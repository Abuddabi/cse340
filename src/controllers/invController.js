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

  res.render("inventory/classification", {
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

  res.render("inventory/detail", {
    title: `${data.inv_make} ${data.inv_model}`,
    nav,
    detail,
    errors: null,
  })
}

invController.buildManagementPage = async (req, res) => {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()
  const links = {
    "classification": "/inv/add-classification",
    "inventory": "/inv/add-inventory"
  }

  res.render("inventory/management", {
    title: "Vehicles management",
    bodyClass: "vehicle-management",
    nav,
    links,
    errors: null,
    classificationList
  })
}

invController.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

invController.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav()

  res.render("inventory/add-classification", {
    title: "Add new classification",
    nav,
    errors: null,
  })
}

invController.addClassification = async (req, res) => {
  const { classification_name } = req.body
  const saveResult = await invModel.saveClassification(classification_name)
  const nav = await utilities.getNav()

  const vars = {
    title: "Add new classification",
    nav,
    errors: null
  }

  if (saveResult) {
    req.flash(
      "notice",
      `Congratulations, a new classification - ${classification_name} was successfully saved.`
    )
    res.status(201).render("inventory/add-classification", vars)
  } else {
    req.flash("notice", `Sorry, a new classification - ${classification_name} was not saved.`)
    res.status(501).render("inventory/add-classification", vars)
  }
}

invController.buildAddInventory = async (req, res) => {
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList()

  res.render("inventory/add-inventory", {
    title: "Add new inventory item",
    nav,
    classificationList,
    errors: null,
    formData: null
  })
}

invController.addInventory = async (req, res) => {
  const saveResult = await invModel.saveInventory(req.body)
  const nav = await utilities.getNav()
  const classificationList = await utilities.buildClassificationList(req.body.classification_id)

  const vars = {
    title: "Add new inventory item",
    nav,
    classificationList,
    errors: null,
    formData: req.body
  }

  if (saveResult) {
    req.flash(
      "notice",
      `Congratulations, a new inventory item - 
      ${req.body.inv_make} ${req.body.inv_model} was successfully saved.`
    )
    res.status(201).render("inventory/add-inventory", vars)
  } else {
    req.flash("notice",
      `Sorry, an inventory item - ${req.body.inv_make} ${req.body.inv_model} was not saved.`)
    res.status(501).render("inventory/add-inventory", vars)
  }
}

function generateError(errorText, code = 400) {
  const statusText = code == 400 ? "Bad request" : code == 404 ? "Not found" : ""
  const newError = new Error(errorText)
  newError.code = code
  newError.status = code + " " + statusText

  return newError
}

module.exports = invController