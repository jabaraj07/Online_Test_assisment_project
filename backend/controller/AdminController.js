const Admin = require("../model/Admin");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const AnswerModel = require("../model/AnswerModel");

exports.createAdmin = async (req, res) => {
  try {
    const email = "admin@gmail.com";
    const password = "admin123";

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      return res.status(400).json({
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await Admin.create({
      email,
      password: hashedPassword,
    });

    res.json({ message: "Admin created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });

    if (!admin) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: admin._id, role: admin.role }, process.env.ADMIN_JWT_SECRET, {
      expiresIn: "1d",
    });

    res.json({ token, role: admin.role });
  } catch (err) {
    console.error("Error logging in admin:", err);
    res.status(500).json({ error: "Failed to login" });
  }
};


exports.getAttemptAnswers =  async (req, res) => {
    try {
      const { attemptId } = req.params;
  
      const answers = await AnswerModel.find({ attemptId });
  
      res.json({
        attemptId,
        totalAnswers: answers.length,
        answers
      });
  
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }