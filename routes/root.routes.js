const express = require("express");
const router = express.Router();
const connection = require("../config/database");

router.get("/", (req, res) => {
  res.render("landing");
});

//---------------------------------DASHBOARD page

router.get("/dashboard", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
    return;
  }

  const userID = req.session.userID;
  const query = `
  SELECT images.image_id, images.image_path, images.caption, users.username, images.created_at,
         COUNT(likes.like_id) AS like_count,
         EXISTS(
             SELECT 1 FROM likes WHERE likes.user_id = ? AND likes.image_id = images.image_id
         ) AS liked_by_user
  FROM images
  JOIN users ON images.user_id = users.user_id
  LEFT JOIN likes ON images.image_id = likes.image_id
  GROUP BY images.image_id
  ORDER BY images.created_at DESC;
  `;

  connection.query(query, [userID], (error, images) => {
    if (error) {
      console.error("Error fetching images:", error);
      return res.status(500).send("Internal server error.");
    }
    res.render("dashboard", { images: images });
  });
});

module.exports = router;
