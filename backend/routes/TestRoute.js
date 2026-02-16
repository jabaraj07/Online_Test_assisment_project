const {
  startTest,
  getAttemptStatus,
  submitTest,
  saveEvent,
  getAttemptEvents,
  getAttemptByUserId,
  getQuestions,
  saveAnswers,
  getAttemptAnswers,
  getAttempts,
  createTestConfiguration,
} = require("../controller/TestController");
const { verifyAttempt } = require("../middleware/auth");

const route = require("express").Router();

route.get("/questions",verifyAttempt,getQuestions);
route.get("/status/:userId", getAttemptByUserId);
route.get("/:attemptId",getAttemptStatus);
route.get("/:attemptId/events",getAttemptEvents);
route.get("/:attemptId/answers",verifyAttempt,getAttemptAnswers);
route.post("/start", startTest);
route.post("/submit/:attemptId",submitTest);
route.post("/:attemptId/event", saveEvent);
route.post("/:attemptId/answers", verifyAttempt,saveAnswers);
route.post("/createTest",createTestConfiguration)

module.exports = route;
