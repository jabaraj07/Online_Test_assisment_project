const mongoose = require('mongoose');
const { randomUUID } = require('crypto');

const attemptSchema = new mongoose.Schema({
  attemptId: {
    type: String,
    unique: true,
    default: () => randomUUID()
  },
  userId: {
    type: String,
    required: true
  },
  testId:{
    type: String,
    required: true,
  },
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  durationInSeconds: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ["IN_PROGRESS", "SUBMITTED", "EXPIRED"],
    default: "IN_PROGRESS"
  },
  submittedAt: {
    type: Date
  }
},{ timestamps: true });

module.exports = mongoose.model("Attempt", attemptSchema);
