// Needed Resources 
const express = require("express")
const router = new express.Router()
const { handleErrors, checkAuthLevel } = require("../utilities/")
const ctrl = require("../controllers/invController")
const invValidate = require("../utilities/inventory-validation")

router.get("/type/:classification_id", handleErrors(ctrl.buildByClassificationId))
router.get("/detail/:itemId", handleErrors(ctrl.buildByItemId))

// Inventory management (Employee or Admin authorization is needed)
router.get("/", checkAuthLevel, handleErrors(ctrl.buildManagementPage))

router.get("/add-classification", checkAuthLevel, handleErrors(ctrl.buildAddClassification))
router.post("/add-classification",
  checkAuthLevel,
  invValidate.classificationRules(),
  invValidate.checkClassificationData,
  handleErrors(ctrl.addClassification)
)

router.get("/add-inventory", checkAuthLevel, handleErrors(ctrl.buildAddInventory))
router.post("/add-inventory",
  checkAuthLevel,
  invValidate.inventoryRules(),
  invValidate.checkInventoryData,
  handleErrors(ctrl.addInventory)
)

router.get("/getInventory/:classification_id", checkAuthLevel, handleErrors(ctrl.getInventoryJSON))

router.get("/edit/:item_id", checkAuthLevel, handleErrors(ctrl.buildEditInventory))
router.post("/update",
  checkAuthLevel,
  invValidate.inventoryRules(),
  invValidate.checkUpdateData,
  handleErrors(ctrl.updateInventory)
)

router.get("/delete/:item_id", checkAuthLevel, handleErrors(ctrl.buildDeleteInventory))
router.post("/delete", checkAuthLevel, handleErrors(ctrl.deleteInventory))

module.exports = router