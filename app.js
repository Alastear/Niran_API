const express = require('express');
const createError = require('http-errors');
const dotenv = require('dotenv').config();
require("./database/config").connect();
const auth = require("./middleware/auth");
const authAdmin = require("./middleware/authAdmin");
const app = express();
var cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Initialize DB
// require('./initDB')();
app.use('/api',authAdmin)

const CarStoreRoute = require('./Routes/Car_Store.route');
app.use('/car/store', CarStoreRoute);
const UserRoute = require('./Routes/User.route');
app.use('/user', UserRoute);
const AdminRoute = require('./Routes/Admin.route');
app.use('/api/admin', AdminRoute);

app.post("/welcome", auth, (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

//404 handler and pass to error handler
app.use((req, res, next) => {

  next(createError(404, 'Not found'));
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

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('Server started on port ' + PORT + '...');
});
