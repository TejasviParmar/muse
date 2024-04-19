require("dotenv").config();
const config = require("./config/config");
const routes = require("./routes/routes");
const express = require("express");
const connection = require("./config/database");
const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const passport = require("passport");
const path = require("path");
const app = express();
const fileUpload = require("express-fileupload");
const flash = require("connect-flash");

const sessionStore = new MySQLStore(
  { expiration: config.session.maxAge },
  connection
);

app.use(fileUpload());
app.use(flash());

app.use(express.urlencoded({ extended: true }));
app.use(express.static("assets"));
app.use(
  session({
    secret: config.session.secret,
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      httpOnly: true,
      secure: false,
      maxAge: config.session.maxAge, // cookie expiry
    },
  })
);

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});

app.use("", routes);

// Start the server
app.listen(config.port, () =>
  console.log(`App listening on port ${config.port}!`)
);
