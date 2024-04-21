const express = require("express");
const router = express.Router();
const connection = require("../config/database");
const userController = require("../controllers/user.controller");

//---------------Click on username, direct to that user profile
router.get("/profile/:username", userController.renderUserProfileByUsername);

//----------------------Logged in user profile
router.get("/profile", userController.userProfile);

//---------------------Username on photo
router.get("/user/:username/:photoUrl", userController.fetchUsernameByPost);

module.exports = router;
