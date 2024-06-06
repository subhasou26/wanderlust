const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const passport = require("passport");
const { saveredirectUrl } = require("../middleware.js");
const userController = require("../controllers/users.js");


router.route("/signup")
.get(userController.renderSignup) // signup from
.post( wrapAsync(userController.signUp)); // signup 



router.route("/login")
.get(userController.renderLogin)
.post(
  saveredirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);

//login
router.post(
  "/login",
  saveredirectUrl,
  passport.authenticate("local", {
    failureRedirect: "/login",
    failureFlash: true,
  }),
  userController.login
);


//logout
router.get("/logout", userController.logout);
module.exports = router;
