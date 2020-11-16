const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const Schema = mongoose.Schema;

// schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Name field is required"],
        maxlength: [255, "You have exceeded the maximum name length[255]"]
    },
    surname: {
        type: String,
        maxlength: [255, "You have exceeded the maximum surname length[255]"]
    },
    username: {
        type: String,
        unique: true,
        required: [true, "Username field is required"],
        maxlength: [100, "You have exceeded the maximum username length[100]"]
    },
    password: {
        type: String,
        minlength: [6, "Password length should be at least 6 characters"],
        select: false,
        required: [true, "Password field is required"]
    },
    email: {
        type: String,
        trim: true,
        index: {
            unique: true,
            partialFilterExpression: { email: { $type: "string" } }
        },
        match: [
            /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/,
            'Please enter a valid email',
        ],
        maxlength: [100, 'You have exceeded the maximum email length[100]'],
    },
    contactNumber: {
        type: String,
        trim: true,
        index: {
            unique: true,
            partialFilterExpression: { contactNumber: { $type: "string" } }
        },
        maxlength: [10, "You have exceeded the maximum phonenumber length[10]"],
    },
    address: {
        type: String,
        maxlength: [225, "You have exceeded the maximum address length[255]"],
    },
    role: {
        type: String,
        enum: ["abc", "def"],
        default: "abc",
        required: [true, "Role field is required"]
    },
    profileImage: {
        type: String,
        maxlength: [255, "You have exceeded the image name length[255]"]
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
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

// Password Encryption
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) {
        next();
    }
    try {
        // generate salt
        const salt = await bcrypt.genSalt(10);

        // set password to hashed password
        this.password = await bcrypt.hash(this.password, salt);

        next();
    } catch (error) {
        next(error);
    }
});

// Confirm Password Match
userSchema.methods.comparePassword = async function (candidatePassword, next) {
    try {
        // confirm password
        const isMatch = await bcrypt.compare(candidatePassword, this.password);

        return isMatch;
    } catch (error) {
        next(error);
    }
};

// Get JSON Web Token
userSchema.methods.generateJSONWebToken = function (next) {
    try {
        const token = jwt.sign({ id: this._id, role: this.role }, process.env.JWT_SECRET, {
            expiresIn: process.env.JWT_EXPIRE
        });

        return token;
    } catch (error) {
        next(error);
    }
};

userSchema.methods.generateResetToken = function () {
    const resetToken = crypto.randomBytes(3).toString("hex");

    this.resetPasswordToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");
    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
};

const User = mongoose.model("User", userSchema, "users");

module.exports = User;