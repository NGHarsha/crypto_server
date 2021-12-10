var express = require("express");
var router = express.Router();
var transactionController = require("../Controllers/transaction-controller");
const checkAuth = require("../middleware/check-auth");

//router.get("/", transactionController.getAllTransactions);
//router.get("/history/:symbol", transactionController.getTransactionHistory);

//the routes below this middleware will be reached only if jwt verification succeeds
router.use(checkAuth);
router.get(
  "/portfolio/:id",
  transactionController.getAggTransactionsByPortfolioId
);
//router.post("/user/:id", transactionController.postTransactionsByUserId);

module.exports = router;
