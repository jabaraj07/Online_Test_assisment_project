const mongoose = require('mongoose');
const EventTypes = require('../constants/eventTypes');

const EventSchema = new mongoose.Schema({
    attemptId: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        enum: Object.values(EventTypes),
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    questionId: {
        type: String
    },
    metadata: {
        type: Object
    }
}, { timestamps: true });
module.exports = mongoose.model('Event', EventSchema);