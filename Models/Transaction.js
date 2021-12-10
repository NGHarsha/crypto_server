const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const transactionSchema = new Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  image: { type: String, required: true },
  volume: { type: Number, required: true },
  atprice: { type: Number, required: true },
  investment: { type: Number, required: true },
  type: {
    type: String,
    required: true,
    enum: ["buy", "sell"],
  },
  portfolio: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "Portfolio",
  },
  user: {
    type: mongoose.Types.ObjectId,
    required: true,
    ref: "User",
  },
});

module.exports = mongoose.model("Transaction", transactionSchema);
