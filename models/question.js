const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// schema
const quesSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ["image", "text", "memory", "mcq"],
        required: [true, "type field is required"]
    },
    question: {
        type: String,
        required: [true, "question field is required"]
    },
    options: [
        {
            type: Schema.Types.ObjectId,
            ref: "Option"
        }
    ],
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

const Question = mongoose.model("Questions", quesSchema, "questions");

module.exports = Question;