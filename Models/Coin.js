const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const coinSchema = new Schema({
  name: { type: String, required: true },
  symbol: { type: String, required: true },
  image: { type: String, required: true },
  volume: { type: Number, required: true },
  atprice: { type: Number, required: true },
  investment: { type: Number, required: true },
  user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("Coin", coinSchema);
