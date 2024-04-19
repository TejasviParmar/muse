const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const connection = require("../config/database");

//-----------login page
router.get("/login", (req, res) => {
  res.render("login", { messages: { error: req.flash("error") } });
});

//handle login form
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  const userQuery = "SELECT * FROM users WHERE username = ?";
  connection.query(userQuery, [username], async (error, users) => {
    if (error) {
      console.error("Login error:", error);
      return res.status(500).send("Error on the server.");
    }

    if (users.length > 0) {
      const validPassword = await bcrypt.compare(
        password,
        users[0].password_hash
      );
      if (validPassword) {
        req.session.userID = users[0].user_id;
        return res.redirect("/dashboard");
      } else {
        req.flash("error", "Invalid password");
        return res.redirect("/login");
      }
    } else {
      req.flash("error", "Username not found.");
      return res.redirect("/login");
    }
  });
});

//---- registration route
router.get("/register", (req, res) => {
  res.render("register-user", { messages: req.flash("error") });
});

router.post("/register", async (req, res) => {
  const { fullname, username, password } = req.body;
  const passwordPattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  if (!passwordPattern.test(password)) {
    req.flash(
      "error",
      "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
    return res.redirect("/register");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  connection.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    async (error, results) => {
      if (error) {
        console.error("Error checking user:", error);
        req.flash("error", "Error on the server.");
        return res.redirect("/register");
      }

      if (results.length > 0) {
        req.flash("error", "Username already taken.");
        res.redirect("/register");
      } else {
        connection.query(
          "INSERT INTO users (name, username, password_hash) VALUES (?, ?, ?)",
          [fullname, username, hashedPassword],
          (error, results) => {
            if (error) {
              console.error("Error registering the user:", error);
              req.flash("error", "Error registering the user.");
              res.redirect("/register");
            } else {
              req.session.userID = results.insertId;
              res.redirect("/login"); // after successful registration
            }
          }
        );
      }
    }
  );
});

router.get("/logout", (req, res) => {
  res.clearCookie("connect.sid");

  // Destroy the session in the session store
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session", err);
      return res.status(500).send("Error logging out");
    }

    res.redirect("/login");
  });
});

module.exports = router;
