const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },
    eventType: {
      type: String,
      required: true,
      enum: [
        "view_product",
        "click_recommendation",
        "add_to_cart",
        "purchase",
        "recommendation_impression",
      ],
      index: true,
    },
    sessionId: {
      type: String,
      required: true,
      index: true,
    },
    experimentGroup: {
      type: String,
      enum: ["A", "B"],
      default: "A",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const Event = mongoose.model("Event", eventSchema);

module.exports = Event;