const jwt = require("jsonwebtoken");
const User = require('../Models/User.model');

const verifyToken = async (req, res, next) => {

    const token =
        req.body.token || req.query.token || req.headers["x-access-token"] || req.headers['authorization'];
    // console.log(req.headers);
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_KEY);
        req.user = decoded;
        const result = await User.findOne({ _id: req.user.user_id });
        // console.log(result);
        if (!result) {
            return res.status(401).send("Invalid User");
        }

    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

module.exports = verifyToken;