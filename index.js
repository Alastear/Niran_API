const express = require('express');
const createError = require('http-errors');
const dotenv = require('dotenv').config();
// require("./database/config").connect();
const mongoose = require("mongoose");
const auth = require("./middleware/auth");
const authAdmin = require("./middleware/authAdmin");
const app = express();
var cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
console.log(mongoose.version);
const PORT = process.env.PORT || 3000;

const whitelist = [
  '*'
];

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log('Server started on port ' + PORT + '...');
  });
})

app.use((req, res, next) => {
  const origin = req.get('referer');
  const isWhitelisted = whitelist.find((w) => origin && origin.includes(w));
  if (isWhitelisted) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,Content-Type,Authorization');
    res.setHeader('Access-Control-Allow-Credentials', true);
  }
  // Pass to next layer of middleware
  if (req.method === 'OPTIONS') res.sendStatus(200);
  else next();
});

const CarStoreRoute = require('./Routes/Car_Store.route');
app.use('/api/store', CarStoreRoute);
const UserRoute = require('./Routes/User.route');
app.use('/api/user', UserRoute);
const AdminRoute = require('./Routes/Admin.route');
app.use('/api/admin', auth, AdminRoute);

app.get("/", (req, res) => {
  res.status(200).send({ status: "success" });
});

//Error handler
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.send({
    error: {
      status: err.status || 500,
      message: err.message
    }
  });
});

