const path = require("path");
const appDir = path.dirname(require.main.filename);

const config = {
  port: process.env.PORT || 3000,
  uploadPath: path.join(appDir, "assets", "uploads"),
  session: {
    secret: process.env.SESSION_SECRET || "secret",
    maxAge: 24 * 60 * 60 * 1000,
  },
};

module.exports = config;
