const express = require("express");
const router = express.Router();
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
router.get("/logout", authController.logout);

module.exports = router;
