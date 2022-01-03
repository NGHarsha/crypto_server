var express = require("express");
const { check } = require("express-validator");
var router = express.Router();
var newsController = require("../Controllers/news-controller");
const checkAuth = require("../middleware/check-auth");

//the routes below this middleware will be reached only if jwt verification succeeds
router.use(checkAuth);
router.get("/", newsController.getLatestNews);
router.get("/images", newsController.getImages);

module.exports = router;
