var express = require("express");
var router = express.Router();
var coinController = require("../Controllers/coin-controller");
const checkAuth = require("../middleware/check-auth");

router.get("/", coinController.getAllCoins);
router.get("/user/:id", coinController.getCoinsByUserId);
router.get("/history/:symbol", coinController.getCoinHistory);

//the routes below this middleware will be reached only if jwt verification succeeds
router.use(checkAuth);
router.post("/user/:id", coinController.postCoinsByUserId);

module.exports = router;
