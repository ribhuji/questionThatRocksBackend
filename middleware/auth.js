const jwt = require("jsonwebtoken");
const ErrorResponse = require("../utils/ErrorResponse");
const User = require("../models/users");

exports.userAuthorized = async (req, res, next) => {
  try {
    let token, headers;

    headers = req.headers.authorization;
    // check if token exists and starts with bearer
    if (headers && headers.startsWith("Bearer")) token = headers.split(" ")[1];
    // else if cookie has token store in it grab that token
	else if (req.cookies.token) token = req.cookies.token; 
	
    // check token
    if (!token) return next(new ErrorResponse("Unauthorized Access", 401));

    // verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // get user by id and store in req
    req.user = await User.findById(decoded.id);

    next();
  } catch (error) {
    next(error);
  }
};

exports.roleAuthorized = (...roles) => async (req, res, next) => {
  try {
    // get user
    const user = await User.findById(req.user.id);

    if (!user) {
      return next(new ErrorResponse("User not found!", 404));
    }

    if (!roles.includes(user.role)) {
      return next(
        new ErrorResponse(
          `User role '${user.role}' is not allowed to access this route`,
          403
        )
      );
    }
    //console.log(req.user.id);

    next();
  } catch (error) {
    next(error);
  }
};
