const mongoose = require("mongoose");

exports.connect = () => {
    try {
        mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
        console.log("Connect DB");
    } catch (error) {
        console.log(error);
    }
}