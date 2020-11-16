const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// schema
const counterSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        maxlength: [4096, "You have exceeded the maximum description length[4096]"]
    },
    sequence_value: {
        type: Number,
        default: 0
    },
});

const Counter = mongoose.model("Counter", counterSchema, "counters");

module.exports = Counter;