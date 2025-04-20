const express = require("express")
const router = express.Router()
const wrapAsync = require("../utils/wrapAsync")
const passport = require("passport")
const { saveRedirect } = require("../middleware")

const UserController = require("../controllers/user")

router.route("/signup")
.get(UserController.renderSignupForm)
.post(wrapAsync(UserController.signup))

router.route("/login")
.get(UserController.renderLoginForm)
.post(saveRedirect ,passport.authenticate('local', { failureRedirect: "/login", failureFlash: true }), UserController.login)

router.get("/logout", UserController.logout)

module.exports = router