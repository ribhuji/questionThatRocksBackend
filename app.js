const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");

// Security Packages
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");
const xssClean = require("xss-clean");
const rateLimit = require("express-rate-limit");
const hpp = require("hpp");
const cors = require("cors");

// load env vars
dotenv.config({ path: "./config/config.env" });

// invoke express
const app = express();

// invoke middlewares
app.use(express.json());
app.use(cookieParser());
app.use(fileUpload());

// security middleware
// rate limit
const limiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 100
});

app.use(mongoSanitize()); //sanitize input to prevent NoSQL Injection
app.use(helmet()); //helmet to add headers and prevent security flaws
app.use(xssClean()); //prevent xss attacks eg <script></script> tags in db
// app.use(limiter); //no of request rate limited
app.use(hpp()); //prevent http param polution
app.use(cors()); //enabled cors for all routes

// static files in public folder
app.use(express.static(path.join(__dirname, "public")));



// api routes
const authRoutes = require("./routes/auth");

app.use("/api/auth", authRoutes);

// Error Handler
app.use(function (req, res, next) {
    let error = new Error("Not Found");
    error.status = 404;
    next(error);
});
const errorHandler = require("./handlers/error");
app.use(errorHandler);
module.exports = app;