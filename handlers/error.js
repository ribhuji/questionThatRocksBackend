const ErrorResponse = require("../utils/ErrorResponse");

function errorHandler(error, request, response, next) {
    let err = {...error };
    let message;

    switch (err.name) {
        case "CastError":
            message = "Resource Not Found";
            err = new ErrorResponse(message, 404);
            break;
        case "ValidationError":
            message = Object.values(err.errors).map(val => val.message);
            err = new ErrorResponse(message, 400);
        default:
            break;
    }

    // Duplicate input error
    if (err.code === 11000) {
        message = "Duplicate Field Value Entered";
        err = new ErrorResponse(message, 400);
    }

    return response.status(err.status || 500).json({
        error: {
            message: err.message || "Oops! Something went wrong"
        }
    });
}

module.exports = errorHandler;