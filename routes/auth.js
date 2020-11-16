const express = require("express");

const router = express.Router({ mergeParams: true });

// middleware
const advancedResults = require("../middleware/advancedResults");
const { userAuthorized, roleAuthorized } = require("../middleware/auth");

// controller methods
const { 
    registerUser,
    loginUser,
    validateUser,
    getCurrentlyLoggedInUser,
    editLoggedInUserDetails,
    updatePassword,
    logoutUser
} = require("../controllers/auth");

// routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/validateuser", validateUser);
router.get("/logout", logoutUser);


router.use(userAuthorized);
router.use(roleAuthorized("abc", "def"));


router.get("/account",  getCurrentlyLoggedInUser);
router.put("/account/edit/password", updatePassword);
router.put("/account/edit", editLoggedInUserDetails);
router.put("/account/edit/profile", userAuthorized);

module.exports = router;