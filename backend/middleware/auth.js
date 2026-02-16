const jwt = require("jsonwebtoken");
const AttemptModel = require("../model/AttemptModel");

exports.verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.ADMIN_JWT_SECRET);

    if (decoded.role !== "ADMIN") {
      return res.status(403).json({ message: "Access denied" });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};


exports.verifyAttempt = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    

    const attempt = await AttemptModel.findOne({
      attemptId: decoded.attemptId
    });

    if (!attempt) {
      return res.status(404).json({ message: "Attempt not found" });
    }

    if (attempt.userId !== decoded.userId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    if (attempt.status !== "IN_PROGRESS") {
      return res.status(403).json({ message: "Test already finished" });
    }

    if (new Date() > attempt.endTime) {
      attempt.status = "EXPIRED";
      await attempt.save();
      return res.status(403).json({ message: "Test expired" });
    }

    req.attempt = attempt;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

