/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const static = require("./src/routes/static")
const inventoryRoute = require("./src/routes/inventoryRoute")
const baseController = require("./src/controllers/baseController")
const u = require("./src/utilities/")
const env = require("dotenv").config()
const app = express()

/* ***********************
 * View Engine and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("views", "./src/views")
app.set("layout", "./layouts/layout") // not at views root

/* ***********************
 * Routes
 *************************/
app.use(static)

// Index route
app.get("/", u.handleErrors(baseController.buildHome))

// Inventory routes
app.use("/inv", inventoryRoute)

app.get("/test", (req, res) => {
  res.render("test", { title: "Test" })
})

// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({ code: 404, message: 'Sorry, we appear to have lost that page.' })
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  const nav = await u.getNav()

  if (err.code == 404 || err.status == 404) {
    message = err.message || "That page doesn't exist."
    if (!err.status) err.status = "404 Not found"
  } else if (err.code == 400) {
    message = err.message || "Please, check the URL."
  } else {
    message = 'Oh no! There was a crash. Maybe try a different route?'
  }

  res.render("errors/error", {
    title: err.status || '500 Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/
const port = process.env.PORT || "5500"
const host = process.env.HOST || "localhost"

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, (err) => {
  if (err) {
    console.log(err)
    return
  }
  console.log(`app listening on ${host}:${port}`)
})
