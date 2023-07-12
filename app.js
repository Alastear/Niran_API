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

const PORT = process.env.PORT || 3000;

const CarStoreRoute = require('./Routes/Car_Store.route');
app.use('/api/store', CarStoreRoute);
const UserRoute = require('./Routes/User.route');
app.use('/api/user', UserRoute);
const AdminRoute = require('./Routes/Admin.route');
app.use('/api/admin', auth, AdminRoute);

app.get("/", (req, res) => {
  res.status(200).send("Welcome 🙌 ");
});

// app.use((req, res, next) => {
//   next(createError(404, 'Not found'));
// });

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



app.listen(PORT, () => {
  console.log('Server started on port ' + PORT + '...');
});
