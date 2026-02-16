const mongoose = require("mongoose");

const testSchema = new mongoose.Schema({
    title:{
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    durationInSeconds:{
        type: Number,
        required: true,
        min:15,
    }
},{timestamps:true});
module.exports = mongoose.model("Test",testSchema);