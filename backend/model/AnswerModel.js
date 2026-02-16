const mongoose = require("mongoose");

const answerSchema = new mongoose.Schema(
  {
    attemptId: {
      type: String,
      required: true,
      index: true,
    },
    questionId: {
      type: String,
      required: true,
      index: true,
    },
    value: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

answerSchema.index({ attemptId: 1, questionId: 1 }, { unique: true });

module.exports = mongoose.model("Answer", answerSchema);
