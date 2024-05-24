const utilities = require("./index")
const { body, validationResult } = require("express-validator")
const validate = {}

/*  **********************************
  *  Inventory Data Validation Rules
  * ********************************* */
validate.classificationRules = () => {
  return [
    body("classification_name")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 1 })
      .withMessage("Please provide a classification name.")
      .matches(/^[a-zA-Z0-9]+$/, "g")
      .withMessage("Classification name cannot contain spaces or special characters."),
  ]
}

/* ******************************
 * Check data and return errors or continue
 * ***************************** */
validate.checkClassificationData = async (req, res, next) => {
  const { classification_name } = req.body
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    res.render("inventory/add-classification", {
      title: "Add new classification",
      nav,
      classification_name,
      errors,
    })
    return
  }
  next()
}

validate.inventoryRules = () => {
  return [
    body("inv_make")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Please provide a Make."),

    body("inv_model")
      .trim()
      .escape()
      .notEmpty()
      .isLength({ min: 3 })
      .withMessage("Please provide a Model."),

    body("inv_year")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Year.")
      .isNumeric()
      .withMessage("Year must be a number.")
      .isLength({ min: 4, max: 4 })
      .withMessage("Year must be a four-digit number."),

    body("inv_description")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Description."),

    body("inv_image")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide an Image path."),

    body("inv_thumbnail")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Thumbnail path."),

    body("inv_price")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Price.")
      .isNumeric()
      .withMessage("Price must be a number."),

    body("inv_miles")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide Miles.")
      .isNumeric()
      .withMessage("Miles must be a number."),

    body("inv_color")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Color."),

    body("classification_id")
      .trim()
      .escape()
      .notEmpty()
      .withMessage("Please provide a Classification.")
      .isNumeric()
      .withMessage("Classification must be a number."),
  ]
}

validate.checkInventoryData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const classificationList = await utilities.buildClassificationList(req.body.classification_id)

    res.render("inventory/add-inventory", {
      title: "Add new inventory",
      nav,
      formData: req.body,
      errors,
      classificationList
    })
    return
  }
  next()
}

validate.inventoryUpdateRules = () => {
  const resultArray = this.inventoryRules();
  resultArray.push(
    body("inv_id")
      .trim()
      .escape()
      .notEmpty()
      .isNumeric()
      .withMessage("Validation error.")
  );

  return resultArray;
}

validate.checkUpdateData = async (req, res, next) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    const nav = await utilities.getNav()
    const formData = req.body
    const classificationList = await utilities.buildClassificationList(formData.classification_id)

    res.render("inventory/edit-inventory", {
      title: `Edit ${formData.inv_make} ${formData.inv_model}`,
      nav,
      formData,
      errors,
      classificationList
    })
    return
  }
  next()
}

module.exports = validate