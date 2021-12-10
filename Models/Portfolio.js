const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const portfolioSchema = new Schema(
  {
    name: { type: String, required: true },
    investment: { type: Number, required: true },
    transactions: [
      { type: mongoose.Types.ObjectId, required: true, ref: "Transaction" },
    ],
    user: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
    isPrimary: { type: Boolean, default: false },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);
