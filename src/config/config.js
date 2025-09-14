const path = require("path");
require("dotenv").config();

const ROOT_DIR = path.join(__dirname, "../..");

module.exports = {
  PORT: process.env.PORT || 8080,
  paths: {
    root: ROOT_DIR,
    views: path.join(__dirname, "../views"),
    public: path.join(__dirname, "../public"),
    data: path.join(ROOT_DIR, "data"),
    productsFile: path.join(ROOT_DIR, "data", "products.json")
  }
};
