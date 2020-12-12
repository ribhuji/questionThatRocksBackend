const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// schema
const optionSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["image", "text"],
        required: [true, "type field is required"]
    },
    value: {
        type: String,
        required: [true, "value field is required"]
    },
    correct: {
        type: Boolean,
        required: [true, "correct is required"],
        default: false
    },
    question: {
        type: Schema.Types.ObjectId,
        ref: "Question",
        required: [true, "question field is required"]
    },
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        versionKey: false,
        transform: (doc, ret) => {
            ret.id = ret._id;
            delete ret._id;
        }
    },
    toObject: {
        virtuals: true
    }
});

const Option = mongoose.model("Options", optionSchema, "options");

module.exports = Option;