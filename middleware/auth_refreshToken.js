const jwt = require("jsonwebtoken");
const { eq } = require("drizzle-orm");
const { db, schema } = require('../database/db');

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
        const [result] = await db.select().from(schema.users).where(eq(schema.users._id, Number(req.user.user_id)));
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