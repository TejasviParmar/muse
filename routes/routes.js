const express = require("express");
const router = express.Router();
const rootRoutes = require("./root.routes");
const authRoutes = require("./auth.routes");
const postRoutes = require("./post.routes");
const userRoutes = require("./user.routes");

const defaultRoutes = [
  { path: "/", routes: rootRoutes },
  { path: "/", routes: authRoutes },
  { path: "/", routes: postRoutes },
  { path: "/", routes: userRoutes },
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.routes);
});

module.exports = router;
