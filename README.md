### Online Assessment System

A secure online examination system built with React (Frontend) and Node.js + Express + MongoDB (Backend).

This system allows users to:

Start a test

Submit answers

Automatically handle test expiration

View results securely

Prevent unauthorized access

🚀 Features
🔐 Authentication & Security

JWT-based attempt authentication

Token expires automatically at test end time

Protected test routes

Middleware-based backend validation

Session-based token storage (sessionStorage)

Auto-expire test on timeout

## Test Flow
## Start Test

- User enters userId

- Backend creates attempt

- JWT token generated

- Token stored in sessionStorage

- Redirect to /test/:attemptId

🔄 Resume Test

Home checks attempt status

If IN_PROGRESS, backend sends new token

Token stored

Redirect to test page

⏳ Timer System

Countdown based on endTime

Auto-submit on timer expiry

Token expires exactly when test ends

📝 Submit Test

Answers saved

Attempt status updated to SUBMITTED

Token & userId removed from session

Redirect to result page

📊 View Result

Fetch attempt details

Secure access validation

Display score & summary

🏗️ Tech Stack
Frontend

React

React Router

Axios

Context API / Hooks

sessionStorage

## Backend

Node.js

Express.js

MongoDB

Mongoose

JWT (jsonwebtoken)

bcrypt


🔐 Security Architecture
Middleware Types
1️⃣ verifyActiveAttempt

Used for Test APIs.
Checks:

Valid token

Matching attemptId

Matching userId

Status === IN_PROGRESS

Not expired

2️⃣ verifyAttemptAccess

Used for Result APIs.
Checks:

Valid token

Matching attemptId

Matching userId

Does NOT require IN_PROGRESS.

🧾 Environment Variables

Create .env file inside server folder:

PORT=5000
MONGO_URI=your_mongodb_connection
JWT_SECRET=your_super_secret_key

▶️ Installation & Setup
1️⃣ Clone Repository
git clone <repo-url>

2️⃣ Install Backend
cd server
npm install
npm run dev

3️⃣ Install Frontend
cd client
npm install
npm start

🌐 API Endpoints
🟢 Start Test
POST /api/attempt/start

🔍 Check Attempt Status
GET /api/attempt/status/:userId

📄 Get Attempt By ID
GET /api/attempt/:attemptId

📝 Submit Test
POST /api/attempt/submit/:attemptId

🧠 Token Handling Strategy
Event	Action
Start Test	Store token
Resume Test	Store token
Submit Test	Remove token
Expired	Remove token
401 Error	Remove token

Token stored in:

sessionStorage

🛡️ Route Protection
Protected Test Route
import { Navigate } from "react-router-dom";

const ProtectedTestRoute = ({ children }) => {
  const token = sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  return children;
};

⚠️ Important Notes

Never store exam token in localStorage

Always expire token based on test end time

Do not allow resume after submission

Use separate middleware for result access

Clear session data after test completion