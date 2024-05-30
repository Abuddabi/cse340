const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const ctrl = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
ctrl.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classification_id
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

ctrl.buildByItemId = async function (req, res, next) {
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

ctrl.buildManagementPage = async (req, res) => {
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

ctrl.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

ctrl.buildAddClassification = async (req, res) => {
  const nav = await utilities.getNav()

  res.render("inventory/add-classification", {
    title: "Add new classification",
    nav,
    errors: null,
  })
}

ctrl.addClassification = async (req, res) => {
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

ctrl.buildAddInventory = async (req, res) => {
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

ctrl.addInventory = async (req, res) => {
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

ctrl.buildEditInventory = async (req, res) => {
  const inv_id = parseInt(req.params.item_id)
  const nav = await utilities.getNav()
  const itemData = await invModel.getItemById(inv_id)
  const classificationList = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`

  res.render("inventory/edit-inventory", {
    title: `Edit ${itemName}`,
    nav,
    classificationList,
    errors: null,
    formData: itemData
  })
}

ctrl.updateInventory = async (req, res) => {
  const formData = req.body
  const updateResult = await invModel.updateInventory(formData)

  if (updateResult) {
    const itemName = `${updateResult.inv_make} ${updateResult.inv_model}`
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(formData.classification_id)
    const itemName = `${formData.inv_make} ${formData.inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
      title: "Edit " + itemName,
      nav,
      classificationList,
      errors: null,
      formData
    })
  }
}

ctrl.buildDeleteInventory = async (req, res) => {
  const inv_id = parseInt(req.params.item_id)
  const itemData = await invModel.getItemById(inv_id)
  if (!itemData) throw generateError("Wrong URL. Check the inventory id.", 404)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  const nav = await utilities.getNav()

  res.render("inventory/delete-confirm", {
    title: `Delete ${itemName}`,
    nav,
    errors: null,
    formData: itemData
  })
}

ctrl.deleteInventory = async (req, res) => {
  const inv_id = parseInt(req.body.inv_id)
  const deleteResult = await invModel.deleteInventory(inv_id)
  const itemName = `${req.body.inv_make} ${req.body.inv_model}`

  if (deleteResult) {
    req.flash("notice", `The ${itemName} was successfully deleted.`)
    res.redirect("/inv/")
  } else {
    const nav = await utilities.getNav()
    req.flash("notice", "Sorry, the deletion failed.")
    res.status(501).render("inventory/delete-confirm", {
      title: "Delete " + itemName,
      nav,
      errors: null,
      formData: req.body
    })
  }
}

function generateError(errorText, code = 400) {
  const statusText = code == 400 ? "Bad request" : code == 404 ? "Not found" : ""
  const newError = new Error(errorText)
  newError.code = code
  newError.status = code + " " + statusText

  return newError
}

module.exports = ctrl