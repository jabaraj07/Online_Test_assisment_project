### Online Assessment System

A secure online examination system built with React (Frontend) and Node.js + Express + MongoDB (Backend).

## This system allows users to:

- Start a test
- Submit answers
- Automatically handle test expiration
- View results
- Prevent unauthorized access

---

### Features
## Authentication & Security

- JWT-based attempt authentication
- Token expires automatically at test end time
- Protected test routes
- Middleware-based backend validation
- Session-based token storage (sessionStorage)
- Auto-expire test on timeout

---

### Test Flow
## Start Test

- User enters userId
- Backend creates attempt
- JWT token generated
- Token stored in sessionStorage
- Redirect to /test/:attemptId
- After submit move to result page

## Resume Test

Home checks attempt status

- If IN_PROGRESS, backend sends new token
- Token stored
- Redirect to test page

## Timer System

- Countdown based on endTime
- Auto-submit on timer expiry
- Token expires exactly when test ends

## Submit Test

- Answers saved
- Attempt status updated to SUBMITTED
- Token & userId removed from session
- Redirect to result page

## View Result

- Fetch attempt details
- Secure access validation
- Display summary of Test

### Tech Stack
## Frontend

1) React
2) React Router
3) Axios
4) Context API / Hooks
5) sessionStorage

## Backend

1) Node.js
2) Express.js
3) MongoDB
4) Mongoose
5) JWT (jsonwebtoken)
6) bcrypt

---

### Security Architecture
## Middleware Types
1️) verifyActiveAttempt
Used for Test APIs.

# Checks:

- Valid token
- Matching attemptId
- Matching userId
- Status === IN_PROGRESS
- Not expired

2️) verifyAttemptAccess
Used for Result APIs.

# Checks:

- Valid token
- Matching attemptId
- Matching userId
- Does NOT require IN_PROGRESS.

## Environment Variables

Create .env file inside server folder:

- PORT=5000
- MONGO_URI=your_mongodb_connection
- JWT_SECRET=your_super_secret_key
- ADMIN_JWT_SECRET=your_super_secret_key

---

### Installation & Setup

1️) Clone Repository
git clone <repo-url>

2️) Install Backend
- cd backend
- npm install
- npm run dev

3️) Install Frontend
- cd Front-End/online_test
- npm install
- npm start

### API Endpoints

1) Start Test
POST /api/attempt/start

2) Check Attempt Status
GET /api/attempt/status/:userId

3) Get Attempt By ID
GET /api/attempt/:attemptId

4) Submit Test
POST /api/attempt/submit/:attemptId

5) To get questions
GET /api/attempt/questions

6) To get events for particular attemptId
GET api/attempt/:attemptId/events

7) protected route for get answer enter by user 
GET api/attempt/:attemptId/answers

8) To store violation event in backend
POST api/attempt/:attemptId/event

9) protected route for store answer in backend
POST api/attempt/:attemptId/answers

🧠 Token Handling Strategy
Event	Action
Start Test	Store token
Resume Test	Store token
Submit Test	Remove token
Expired	Remove token
401 Error	Remove token

## Token stored in:
sessionStorage

### Admin Panel

## The system includes a secure Admin Dashboard for monitoring test activity, viewing attempts, reviewing audit logs, and inspecting user answers.

### Admin Authentication Flow
## 1)  Admin Login
Route (Frontend):
```bash
http://localhost:3000/admin/login
```
- Admin enters email and password
- Backend verifies credentials
- JWT token is generated
- Token stored in sessionStorage
- Redirects to protected route:

```bash
/admin/attempts
```
## 2) Backend Login API
```pgsql
POST /api/admin/login
```
RESPONSE:
```json
{
  "token": "jwt_token_here",
  "role": "ADMIN"
}
```

### Admin Route Protection
## Frontend Protection

All admin routes are wrapped inside AdminRoute:

```jsx
<Route
  path="/admin/attempts"
  element={
    <AdminRoute>
      <AdminAttempts />
    </AdminRoute>
  }
/>

<Route
  path="/admin/attempt/:attemptId"
  element={
    <AdminRoute>
      <AdminAudit />
    </AdminRoute>
  }
/>

<Route
  path="/admin/attempt/:attemptId/answers"
  element={
    <AdminRoute>
      <AdminAnswer />
    </AdminRoute>
  }
/>
```

AdminRoute checks:

- Token exists
- Role is ADMIN

If invalid → redirect to /admin/login

## Backend Protection
All admin APIs are protected using middleware:

```js
route.get("/attempts", verifyAdmin, getAttempts);
route.get("/attempt/:attemptId/answers", verifyAdmin, getAttemptAnswers);
```

verifyAdmin middleware checks:

- JWT validity
- Role === "ADMIN"

### Admin Features
## 1) View All Attempts

Route:
```bash
/admin/attempts
```
Admin can:
- View all user attempts
- See attempt status:
1) IN_PROGRESS
2) UBMITTED
3) EXPIRED
- Monitor total attempts
- See completion statistics

## 2) View Audit Trail
ROUTE :
```bash
/admin/attempt/:attemptId
```
Admin can see:

- All user activity during test
- Event timeline
- Security violations
- Suspicious behavior

All events are logged in backend per attemptId.

## 3) View User Answers
ROUTE:
```ruby
/admin/attempt/:attemptId/answers
```

### Undefined Routes

All unknown routes are captured using:
```jsx
<Route path="*" element={<NotFound />} />
```
Admin can:
- View selected answers
- Review submitted responses
- Analyze answer behavior


### Audit Event Logging System

The system tracks and logs user behavior during the test.

## Tracked Events
```js
const EVENT_TYPES = {
  TIMER_STARTED,
  TIMER_EXPIRED,
  AUTO_SUBMIT,
  TAB_SWITCH,
  FOCUS_LOST,
  COPY_ATTEMPT,
  PASTE_ATTEMPT,
  FULLSCREEN_EXIT,
  TAB_HIDDEN,
  TAB_VISIBLE,
  TEST_SUBMITTED,
  WARNING_THRESHOLD_REACHED,
  RIGHT_CLICK_BLOCKED,
  DEVTOOLS_ATTEMPT,
  VIOLATION_LIMIT_REACHED,
  KEYBOARD_SHORTCUT_BLOCKED,
};
```
Each event is:
- Logged with timestamp
- Stored with attemptId
- Accessible via Admin Audit View


### Admin API Endpoints

# Base Route:

```bash
/api/admin
```

# Login:

```bash
POST /login
```

# Get All Attempts
```bash
GET /attempts
```

# Get Attempt Answers
```ruby
GET /attempt/:attemptId/answers
```

All routes protected via verifyAdmin middleware.
