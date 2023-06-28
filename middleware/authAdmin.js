const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
    const token =
        req.body.token || req.query.token || req.headers["x-access-token"] || req.headers['authorization'];
    // console.log(req.headers);
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const decoded = jwt.verify(token, process.env.TOKEN_KEY);
        req.user = decoded;
        if (req.user.user_position !== 'ADMIN') {
            return res.status(401).send("Invalid Admin Only");
        }
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

module.exports = verifyToken;