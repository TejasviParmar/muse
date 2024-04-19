const express = require("express");
const router = express.Router();
const connection = require("../config/database");

//---------------Click on username, direct to that user profile
router.get("/profile/:username", (req, res) => {
  const username = req.params.username;

  const query = `
    SELECT images.image_id, images.image_path, images.caption, images.created_at, 
           COUNT(likes.like_id) AS like_count, 
           EXISTS(SELECT 1 FROM likes WHERE likes.user_id = ? AND likes.image_id = images.image_id) AS liked_by_user
    FROM users
    JOIN images ON users.user_id = images.user_id
    LEFT JOIN likes ON images.image_id = likes.image_id
    WHERE users.username = ?
    GROUP BY images.image_id
    ORDER BY images.created_at DESC;
  `;

  connection.query(query, [req.session.userID, username], (error, results) => {
    if (error) {
      console.error("Error fetching user profile:", error);
      return res.status(500).send("Internal server error.");
    }

    const userImages = results.map((image) => ({
      image_id: image.image_id,
      image_path: image.image_path,
      caption: image.caption,
      like_count: image.like_count || 0,
      liked_by_user: image.liked_by_user,
      created_at: image.created_at,
    }));

    res.render("profile", {
      username: username,
      userImages: userImages,
    });
  });
});

//----------------------Logged in user profile
router.get("/profile", (req, res) => {
  if (!req.session.userID) {
    res.redirect("/login");
    return;
  }

  const userID = req.session.userID;
  const profileQuery = `
    SELECT users.username, images.image_id, images.image_path, images.caption, images.created_at,
           COUNT(likes.like_id) AS like_count 
    FROM users 
    LEFT JOIN images ON users.user_id = images.user_id 
    LEFT JOIN likes ON images.image_id = likes.image_id 
    WHERE users.user_id = ? 
    GROUP BY images.image_id 
    ORDER BY images.created_at DESC;
  `;

  connection.query(profileQuery, [userID], (error, results) => {
    if (error) {
      console.error("Error fetching profile and images:", error);
      return res.status(500).send("Internal server error.");
    }

    const userImages = results
      .filter((row) => row.image_path) // Only include results with an image path
      .map((row) => ({
        image_id: row.image_id,
        image_path: row.image_path,
        caption: row.caption,
        like_count: row.like_count || 0,
        created_at: row.created_at,
      }));

    const hasPosts = userImages.length > 0;

    res.render("profile", {
      username: results[0] ? results[0].username : "Unknown",
      userImages: userImages,
      hasPosts: hasPosts, // Pass this new variable to the template
    });
  });
});

//---------------------Username on photo
router.get("/user/:username/:photoUrl", (req, res) => {
  const username = req.params.username;
  const photoUrl = req.params.photoUrl;
  res.render("user_photo", { username, photoUrl });
});

module.exports = router;
