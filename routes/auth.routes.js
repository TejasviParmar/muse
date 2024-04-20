const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const connection = require("../config/database");
const authController = require("../controllers/auth.controller");

//-----------Login route
router.get("/login", (req, res) => {
  res.render("login", { messages: { error: req.flash("error") } });
});

router.post("/login", authController.login);

//---- Register route
router.get("/register", (req, res) => {
  res.render("register-user", { messages: req.flash("error") });
});

router.post("/register", authController.register);

//-----Logout route
router.get("/logout", (req, res) => {
  res.clearCookie("connect.sid");
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
      return res.status(500).send("Error logging out");
    }
    res.redirect("/login");
  });
});

module.exports = router;
