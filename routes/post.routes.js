const express = require("express");
const router = express.Router();
const postController = require("../controllers/post.controller");

// -------------- upload route
router.get("/uploadpage", (req, res) => {
  return res.render("upload-image");
});

router.post("/upload", postController.upload);

//----------------------Like image route
router.post("/like/:image_id", postController.likePost);

module.exports = router;
