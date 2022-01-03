const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const currencySchema = new Schema({
  code: {
    type: String,
  },
  title: {
    type: String,
  },
  slug: {
    type: String,
  },
  url: {
    type: String,
  },
});

const newsSchema = new Schema(
  {
    news_id: { type: Number },
    title: { type: String },
    kind: { type: String },
    domain: { type: String },
    published_at: { type: Date },
    url: { type: String },
    currencies: [currencySchema],
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

module.exports = mongoose.model("News", newsSchema);
