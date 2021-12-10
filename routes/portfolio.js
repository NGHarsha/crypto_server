var express = require("express");
const { check } = require("express-validator");
var router = express.Router();
var portfolioController = require("../Controllers/portfolio-controller");
const checkAuth = require("../middleware/check-auth");

//the routes below this middleware will be reached only if jwt verification succeeds
router.use(checkAuth);
router.get("/user/:id", portfolioController.getPortfoliosByUserId);
router.post(
  "/user/:id",
  [check("name").not().isEmpty()],
  portfolioController.createPortfolioByUserId
);
router.post("/:id", portfolioController.addTransactionByPortfolioId);

module.exports = router;
