// Needed Resources 
const express = require("express")
const router = new express.Router()
const { handleErrors } = require("../utilities/")
const ctrl = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")

// Inventory management 
router.get("/", handleErrors(ctrl.buildManagementPage))

router.get("/type/:classificationId", handleErrors(ctrl.buildByClassificationId))
router.get("/detail/:itemId", handleErrors(ctrl.buildByItemId))

router.get("/add-classification", handleErrors(ctrl.buildAddClassification))
router.post("/add-classification", 
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  handleErrors(ctrl.addClassification)
)

router.get("/add-inventory", handleErrors(ctrl.buildAddInventory))
router.post("/add-inventory", 
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  handleErrors(ctrl.addInventory)
)

module.exports = router