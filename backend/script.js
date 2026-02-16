const express = require('express');
const app = express();
const dotenv = require('dotenv');
const connectDB = require('./service/db');
const testRoute = require('./routes/TestRoute');
const cors = require('cors');
const adminRoute = require('./routes/adminRoute');


dotenv.config();

const allowedOrigins = [
  "http://localhost:3000",
  process.env.FRONTEND_URL,
];


app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json());

connectDB();

app.use('/api/attempt',testRoute);
app.use('/api/admin',adminRoute);

app.get('/',(req,res)=>{
    res.send('Hello World!');
})

app.listen(process.env.PORT,()=>{
    console.log(`Server is running on port ${process.env.PORT}`);
})