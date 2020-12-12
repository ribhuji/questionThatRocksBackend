const path = require("path");
const db = require("../models");
const ErrorResponse = require("../utils/ErrorResponse");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const dotenv = require("dotenv");
dotenv.config({ path: "../config/config.env" });
const deleteNull = require("delete-null");


/**
 * @desc    Validate User
 * @route   POST /api/auth/validateuser
 * @access  Public
 */
exports.validateUser = async (req, res, next) => {
    try {

        const { username, email, contactNumber } = req.body;
        let data = {}
        if (!(username || email || contactNumber)) {
            return next(
                new ErrorResponse("username or email or contactNumber fields are required", 400)
            );
        }

        if (username) {
            var userUsername = await db.User.findOne({ "username": username });
            if (!userUsername) {
                data['username'] = "available";
            } else {
                data['username'] = "not available";
            }
        }

        if (email) {
            var userEmail = await db.User.findOne({ "email": email });
            if (!userEmail) {
                data['email'] = "available";
            } else {
                data['email'] = "not available";
            }
        }

        if (contactNumber) {
            var usercontactNumber = await db.User.findOne({ "contactNumber": contactNumber });
            if (!usercontactNumber) {
                data['contactNumber'] = "available";
            } else {
                data['contactNumber'] = "not available";
            }
        }

        return res.status(200).json({
            data: data
        });

    } catch (error) {
        next(error);
    }
};


/**
 * @desc    Register New User
 * @route   POST /api/auth/register
 * @access  Public
 */
exports.registerUser = async (req, res, next) => {
    try {
        //console.log(req.user.id);
        var bodyRec = req.body;
        //check if all the fielda are present or not
        if(!bodyRec.hasOwnProperty('name')){
            return next(new ErrorResponse('Please enter name', 400));
        } else if(!bodyRec.hasOwnProperty('surname')){
            return next(new ErrorResponse('Please enter surname', 400));
        } else if(!bodyRec.hasOwnProperty('password')){
            return next(new ErrorResponse('Please enter password', 400));
        } else if(!bodyRec.hasOwnProperty('email')){
            return next(new ErrorResponse('Please enter email', 400));
        } else if(!bodyRec.hasOwnProperty('contactNumber')){
            return next(new ErrorResponse('Please enter contactNumber', 400));
        } else if(!bodyRec.hasOwnProperty('role')){
            return next(new ErrorResponse('Please enter role', 400));
        }
        // const hello = await db.Counter.create({'_id': 'userid', 'sequence_value': 0});

        //find if email already in use
        var userEmail = await db.User.findOne({ "email": bodyRec['email'] });
        if (userEmail) {
            return next(new ErrorResponse("email already registered", 401));
        }

        bodyRec['name'] = bodyRec['name'].trim();
        bodyRec['surname'] = bodyRec['surname'].trim();

        var counterUser = await db.Counter.findOne({name: 'userid'});
        if(!counterUser){
            await db.Counter.create({name: "userid", sequence_value: 0});
        }
        var counterobj = await db.Counter.findOneAndUpdate({name: 'userid'}, { $inc: { sequence_value: 1 } }, { upsert: true });
        //console.log(counterobj);
        //console.log(bodyRec['name'].trim().toLowerCase());
        var username = bodyRec['name'].toLowerCase() + bodyRec['surname'].toLowerCase() + counterobj.sequence_value;
        var obj = {
            "name": bodyRec['name'],
            "surname": bodyRec['surname'],
            "username": username,
            "password": bodyRec['password'],
            "email": bodyRec['email'],
            "contactNumber": bodyRec['contactNumber'],
            "role": bodyRec['role'],
            "address": bodyRec['address'] ? bodyRec['address'] : null
        };
        //console.log(obj);

        var user = await db.User.create(obj);
        user.save({ validateBeforeSave: false });


        // get JWT Token
        getTokenResponse(user, 201, res);
    } catch (error) {
        //console.log(error);
        next(error);
    }
};


/**
 * @desc    Login User
 * @route   POST /api/auth/login
 * @access  Public
 */
exports.loginUser = async (req, res, next) => {
    try {
        // get username and password
        const { username, password } = req.body;

        if (!username || !password) {
            return next(
                new ErrorResponse("username and password fields are required", 400)
            );
        }

        // get user by username
        var user = await db.User.findOne({ $or: [{ 'username': username }, { 'email': username }] }).select("+password");

        if (user == null) {
            return next(new ErrorResponse("Invalid credentials", 401));
        }

        // confirm password input was correct
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return next(new ErrorResponse("Invalid credentials", 401));
        }

        // JSONWeb Token
        getTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Logout User/ Clear Cookie
 * @route   GET /api/auth/logout
 * @access  Private
 */
exports.logoutUser = async (req, res, next) => {
    try {
        // expire cookie after 10 seconds
        return res
            .cookie("token", "none", {
                expires: new Date(Date.now() + 10 * 1000), //expire in 10 seconds
                httpOnly: true
            })
            .status(200)
            .json({ success: true, message: "User logged out successfully" });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Get Currently Logged In User
 * @route   POST /api/auth/account
 * @access  Private
 */
exports.getCurrentlyLoggedInUser = async (req, res, next) => {
    try {
        // get user from req object
        const user = await db.User.findById(req.user._id);

        return res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Edit User Details
 * @route   PUT /api/auth/account/edit
 * @access  Private
 */
exports.editLoggedInUserDetails = async (req, res, next) => {
    try {
        // get fields to be updated
        const updatedFields = {
            name: req.body.name || req.user.name,
            surname: req.body.surname || req.user.surname,
            email: req.body.email || req.user.email,
            contactNumber: req.body.contactNumber || req.user.contactNumber
        };

        // find user by id
        const user = await db.User.findById(req.user._id)

        if (user == null) {
            return next(new ErrorResponse("User not found", 404));
        }

        // update user
        const updatedUser = await db.User.findByIdAndUpdate(
            req.user._id,
            updatedFields, {
            new: true,
            runValidators: false
        }
        );

        return res.status(200).json({ success: true, updatedUser });
    } catch (error) {
        next(error);
    }
};

/**
 * @desc    Update User Password
 * @route   PUT /api/auth/account/edit/password
 * @access  Private
 */
exports.updatePassword = async (req, res, next) => {
    try {
        // password ops
        const { oldPassword, password, confirmPassword } = req.body;
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/;

        // check password input
        if (!password || !confirmPassword || !oldPassword) {
            return next(
                new ErrorResponse(
                    "Password, Confirm Password and Old Password fields are required",
                    400
                )
            );
        }

        // check password validity
        if (regex.test(password) === false) {
            return next(
                new ErrorResponse(
                    "Please enter a valid password, at least one lowercase and uppercase letter and one number",
                    400
                )
            );
        }

        // check confirm password match
        if (password !== confirmPassword) {
            return next(
                new ErrorResponse(
                    "Password and Confirm Password fields must match",
                    400
                )
            );
        }

        // check if password matches with one in db
        const user = await db.User.findById(req.user._id).select("+password");
        if (!user) {
            return next(new ErrorResponse("User not found", 404));
        }

        const isMatch = await bcrypt.compare(oldPassword, user.password);

        // if match
        if (!isMatch) {
            return next(new ErrorResponse("Invalid credentials", 401));
        }

        // change password
        user.password = password;

        // save
        await user.save({ validateBeforeSave: false });

        // generate JWT
        getTokenResponse(user, 200, res);
    } catch (error) {
        next(error);
    }
};


// Store JWT in cookie
const getTokenResponse = (model, statusCode, res) => {
    // token
    const token = model.generateJSONWebToken();

    // cookie options
    const options = {
        expires: new Date(
            Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
        ),
        httpOnly: true
    };

    // in production cookie is secure
    if (process.env.NODE_ENV == "production") {
        options.secure = true;
    }

    return res
        .status(statusCode)
        .cookie("token", token, options)
        .json({ success: true, user: model, token });
};
