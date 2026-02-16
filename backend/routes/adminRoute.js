const express = require("express");
const route = express.Router();
const { createAdmin, loginAdmin } = require("../controller/AdminController");
const { getAttempts, getAttemptAnswers } = require("../controller/TestController");
const { verifyAdmin } = require("../middleware/auth");

// route.get('/create-admin',createAdmin);
route.post('/login',loginAdmin);
route.get("/attempts", verifyAdmin, getAttempts);
route.get("/attempt/:attemptId/answers", verifyAdmin, getAttemptAnswers);

module.exports = route;