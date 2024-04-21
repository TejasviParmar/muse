const connection = require("../config/database");
const config = require("../config/config");
const path = require("path");

async function upload(req, res) {
  console.log("Attempting to upload image...");

  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send("No files were uploaded.");
  }

  const uploadedFile = req.files.image;
  const caption = req.body.caption;

  //--------- Validate file type
  const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
  if (!validImageTypes.includes(uploadedFile.mimetype)) {
    return res
      .status(400)
      .send("Invalid file type. Only image files are allowed.");
  }

  const datePrefix = new Date()
    .toISOString()
    .slice(0, 19)
    .replace(/[-:T]/g, "");

  const newFilename = datePrefix + "_" + uploadedFile.name;

  uploadedFile.mv(path.join(config.uploadPath, newFilename), (err) => {
    if (err) {
      console.error("Error moving the file: ", err);
      return res.status(500).send(err);
    }

    const insertQuery =
      "INSERT INTO images (user_id, image_path, caption, created_at) VALUES (?, ?, ?, NOW())";

    const userID = req.session.userID;

    connection.query(
      insertQuery,
      [userID, newFilename, caption],
      (error, results) => {
        if (error) {
          console.error(
            "Error inserting image data into the database: ",
            error
          );
          return res
            .status(500)
            .send("Error saving image data into the database.");
        }
        console.log(
          "Image data inserted successfully into the database with ID:",
          results.insertId
        );
        return res.redirect("/dashboard");
      }
    );
  });
}

async function likePost(req, res) {
  if (!req.session.userID) {
    return res.status(401).json({ error: "User not logged in." });
  }

  connection.beginTransaction((err) => {
    if (err) {
      return res.status(500).json({ error: "Transaction start error." });
    }

    const userID = req.session.userID;
    const imageID = req.params.image_id;

    const checkLikeQuery =
      "SELECT 1 FROM likes WHERE user_id = ? AND image_id = ?";

    connection.query(checkLikeQuery, [userID, imageID], (error, results) => {
      if (error) {
        return connection.rollback(() => {
          console.error("Error checking like:", error);
          res
            .status(500)
            .json({ error: "Error processing like/unlike operation." });
        });
      }

      const operationPromise =
        results.length === 0
          ? connection
              .promise()
              .query("INSERT INTO likes (user_id, image_id) VALUES (?, ?)", [
                userID,
                imageID,
              ])
          : connection
              .promise()
              .query("DELETE FROM likes WHERE user_id = ? AND image_id = ?", [
                userID,
                imageID,
              ]);

      operationPromise
        .then(() => {
          return connection
            .promise()
            .query(
              "SELECT COUNT(*) AS like_count FROM likes WHERE image_id = ?",
              [imageID]
            );
        })
        .then(([likeCounts]) => {
          const like_count = likeCounts[0].like_count;
          const liked = results.length === 0;

          connection.commit((err) => {
            if (err) {
              return connection.rollback(() => {
                res.status(500).json({ error: "Transaction commit error." });
              });
            }
            res.json({
              message: liked ? "Liked successfully." : "Unliked successfully.",
              liked,
              like_count,
            });
          });
        })
        .catch((error) => {
          console.error("Error during like/unlike operation:", error);
          connection.rollback(() => {
            res
              .status(500)
              .json({ error: "Error processing like/unlike operation." });
          });
        });
    });
  });
}

module.exports = { upload, likePost };
