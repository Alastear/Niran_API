const jwt = require("jsonwebtoken");
const { eq } = require("drizzle-orm");
const { db, schema } = require('../database/db');

// ตรวจ JWT + ดึงสิทธิ์จาก role ของ user
// แยกออกมาเป็นฟังก์ชันเพราะ route ที่ออก token ให้ Vercel Blob client upload
// รับ token มาทาง body (SDK ส่ง header เองไม่ได้) จึงใช้ middleware ปกติไม่ได้
async function resolveUserFromToken(token) {
    const decoded = jwt.verify(token, process.env.TOKEN_KEY);
    const [result] = await db.select().from(schema.users).where(eq(schema.users._id, Number(decoded.user_id)));
    if (!result) return null;

    let permissions = [];
    if (result.role_id) {
        const [role] = await db.select().from(schema.roles).where(eq(schema.roles._id, result.role_id));
        if (role && Array.isArray(role.permissions)) permissions = role.permissions;
    }
    // เผื่อ user เก่าที่ยังไม่มี role: ถ้าเป็น ADMIN ให้สิทธิ์เต็ม
    if (!permissions.length && result.position === 'ADMIN') {
        permissions = require('../config/permissions').ALL_PERMISSIONS;
    }
    return { ...decoded, permissions, role_id: result.role_id };
}

const verifyToken = async (req, res, next) => {

    const token =
        req.body.token || req.query.token || req.headers["x-access-token"] || req.headers['authorization'];
    // console.log(req.headers);
    if (!token) {
        return res.status(403).send("A token is required for authentication");
    }
    try {
        const user = await resolveUserFromToken(token);
        if (!user) {
            return res.status(401).send("Invalid User");
        }
        req.user = user;
    } catch (err) {
        return res.status(401).send("Invalid Token");
    }
    return next();
};

module.exports = verifyToken;
module.exports.resolveUserFromToken = resolveUserFromToken;
