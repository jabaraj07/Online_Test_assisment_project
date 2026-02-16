const AttemptModel = require("../model/AttemptModel");
const EventModel = require("../model/EventModel");
const AnswerModel = require("../model/AnswerModel");
const TestModel = require("../model/TestModel");
const jwt = require('jsonwebtoken')

const SAMPLE_QUESTIONS = [
  {
    questionId: "q1",
    text: "In your own words, describe what integrity means in a workplace.",
    type: "text",
  },
  {
    questionId: "q2",
    text: "Give a short example of how you handled a difficult deadline.",
    type: "text",
  },
  {
    questionId: "q3",
    text: "What is your approach to working in a team? (2–3 sentences)",
    type: "text",
  },
];

exports.startTest = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res
        .status(400)
        .json({ message: "userId and durationInSeconds are required" });
    }

    const test = await TestModel.findOne();

    if (!test) {
      return res.status(404).json({ message: "Test not configured" });
    }

    // 🔥 Find ANY existing attempt (not just IN_PROGRESS)
    const existingAttempt = await AttemptModel.findOne({ userId });

    if (existingAttempt) {
      // If still running
      if (
        existingAttempt.status === "IN_PROGRESS" &&
        new Date() <= existingAttempt.endTime
      ) {
        return res.status(400).json({
          message: "Assessment already in progress",
          attemptId: existingAttempt.attemptId,
          endTime: existingAttempt.endTime,
        });
      }

      // If expired but not updated yet
      if (
        existingAttempt.status === "IN_PROGRESS" &&
        new Date() > existingAttempt.endTime
      ) {
        existingAttempt.status = "EXPIRED";
        await existingAttempt.save();
      }

      // 🚫 Block new attempt
      return res.status(400).json({
        message: "Assessment already completed",
        attemptId: existingAttempt.attemptId,
        status: existingAttempt.status,
      });
    }

    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + test.durationInSeconds * 1000);

    const attempt = new AttemptModel({
      userId,
      startTime,
      endTime,
      testId: test._id,
      durationInSeconds : test.durationInSeconds,
      status: "IN_PROGRESS"
    });
    await attempt.save();

    // 🔥 Calculate token expiry dynamically
    const nowInSeconds = Math.floor(Date.now() / 1000);
    const endTimeInSeconds = Math.floor(endTime.getTime() / 1000);
    const expiresInSeconds = endTimeInSeconds - nowInSeconds;

    const token = jwt.sign(
      {
        userId: attempt.userId,
        attemptId: attempt.attemptId
      },
      process.env.JWT_SECRET,
      { expiresIn: expiresInSeconds }
    );

    res.status(201).json({
      attemptId: attempt.attemptId,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      status: attempt.status,
      Token : token
    });
  } catch (error) {
    console.error("Error starting attempt:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAttemptStatus = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const attempt = await AttemptModel.findOne({ attemptId });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.status === "IN_PROGRESS") {
      if (new Date() > attempt.endTime) {
        attempt.status = "EXPIRED";
        await attempt.save();
      }
    }
    res.json({
      attemptId: attempt.attemptId,
      userId: attempt.userId,
      startTime: attempt.startTime,
      endTime: attempt.endTime,
      status: attempt.status,
      submittedAt: attempt.submittedAt,
    });
  } catch (error) {
    console.error("Error fetching attempt status:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.submitTest = async (req, res) => {
  try {
    const { attemptId } = req.params;

    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required" });
    }

    const attempt = await AttemptModel.findOne({ attemptId });

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const now = new Date();

    // 🔐 If already submitted
    if (attempt.status === "SUBMITTED") {
      return res.status(400).json({ message: "Already submitted" });
    }

    // 🔐 If already expired
    if (attempt.status === "EXPIRED") {
      return res.status(400).json({ message: "Attempt already expired" });
    }

    // 🔐 Expire automatically if time passed
    if (now > attempt.endTime) {
      attempt.status = "EXPIRED";
      await attempt.save();

      return res.status(400).json({
        message: "Attempt has expired",
        status: "EXPIRED",
      });
    }

    // ✅ Normal submit
    attempt.status = "SUBMITTED";
    attempt.submittedAt = now;

    await attempt.save();

    return res.json({
      message: "Test submitted successfully",
      attemptId: attempt.attemptId,
      status: attempt.status,
      submittedAt: attempt.submittedAt,
    });
  } catch (error) {
    console.error("Error submitting attempt:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.saveEvent = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { events, metadata } = req.body;

    if (!Array.isArray(events) || events.length === 0) {
      return res.status(400).json({ message: "Events array is required" });
    }

    const attempt = await AttemptModel.findOne({ attemptId });

    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required" });
    }

    if (attempt.status === "SUBMITTED") {
      return res.status(400).json({
        message: "Cannot log events. Attempt already submitted.",
      });
    }

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (new Date() > attempt.endTime) {
      attempt.status = "EXPIRED";
      await attempt.save();
      return res.status(400).json({ message: "Attempt expired" });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return res.status(400).json({ message: "Attempt is not in progress" });
    }

    // Prepare events for insertion
    const formattedEvents = events.map((event) => ({
      attemptId,
      eventType: event.eventType,
      questionId: event.questionId,
      metadata: { ...event.metadata, ...metadata } || {}, // Merge event-specific metadata with any global metadata
      timestamp: new Date(),
    }));

    console.log("Saving events:", formattedEvents);

    await EventModel.insertMany(formattedEvents);

    return res.status(201).json({
      message: "Events logged successfully",
      count: formattedEvents.length,
    });
  } catch (error) {
    console.error("Error saving event:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAttemptEvents = async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required" });
    }
    const attempt = await AttemptModel.findOne({ attemptId });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    const events = await EventModel.find({ attemptId })
      .sort({ timestamp: 1 })
      .lean();

    return res.status(200).json({
      attemptId: attempt.attemptId,
      status: attempt.status,
      totalEvents: events.length,
      events: events,
    });
  } catch (error) {
    console.error("Error fetching attempt events:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getAttemptByUserId = async (req, res) => {
  const { userId } = req.params;

  const attempt = await AttemptModel.findOne({ userId });

  if (!attempt) {
    return res.json({ status: "NOT_FOUND" });
  }

  let token = null;

    // Only generate token if test is still active
    if (attempt.status === "IN_PROGRESS") {
      token = jwt.sign(
        {
          userId: attempt.userId,
          attemptId: attempt.attemptId,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: Math.floor(
            (new Date(attempt.endTime) - new Date()) / 1000
          ), // expire exactly at test end
        }
      );
    }

  return res.json({
    status: attempt.status,
    attemptId: attempt.attemptId,
    token
  });
};

exports.getQuestions = async (req, res) => {
  try {
    return res.status(200).json({ questions: SAMPLE_QUESTIONS });
  } catch (error) {
    console.error("Error fetching questions:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.saveAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required" });
    }
    if (!Array.isArray(answers)) {
      return res.status(400).json({ message: "answers array is required" });
    }

    const attempt = await AttemptModel.findOne({ attemptId });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }
    if (attempt.status !== "IN_PROGRESS") {
      return res.status(400).json({
        message: "Cannot update answers. Attempt is not in progress.",
      });
    }

    for (const a of answers) {
      if (!a.questionId) continue;
      await AnswerModel.findOneAndUpdate(
        { attemptId, questionId: a.questionId },
        { value: a.value != null ? String(a.value) : "" },
        { upsert: true, new: true },
      );
    }

    return res
      .status(200)
      .json({ message: "Answers saved", count: answers.length });
  } catch (error) {
    console.error("Error saving answers:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAttemptAnswers = async (req, res) => {
  try {
    const { attemptId } = req.params;
    if (!attemptId) {
      return res.status(400).json({ message: "attemptId is required" });
    }

    const attempt = await AttemptModel.findOne({ attemptId });
    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    const answers = await AnswerModel.find({ attemptId }).lean();
    const byQuestion = answers.reduce((acc, a) => {
      acc[a.questionId] = a.value;
      return acc;
    }, {});

    return res.status(200).json({ attemptId, answers: byQuestion });
  } catch (error) {
    console.error("Error fetching answers:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getAttempts = async (req, res) => {
  try {
    const attempts = await AttemptModel.find().sort({ createdAt: -1 });

    return res.status(200).json(attempts);
  } catch (error) {
    console.error("Error fetching attempts:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.createTestConfiguration = async (req, res) => {
  try {
    const { title, durationInSeconds } = req.body;
    if (!title || !durationInSeconds) {
      res.status(404).json({ message: "All fields required" });
    }
    const Test = await TestModel.findOne({ title });
    if (Test) {
      res.status(404).json({ message: "choose another Test title" });
    }
    const Data = new TestModel({ title, durationInSeconds });
    const Result = await TestModel.create(Data);
    res
      .status(201)
      .json({
        message: "Test configuration created successfully",
        TestId: Result._id,
      });
  } catch (error) {
    console.error(`Error in Test-configuration ${error.message}`);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
