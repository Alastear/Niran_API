// ใช้ต่อจาก auth middleware (ซึ่งแนบ req.user.permissions ไว้แล้ว)
// ตัวอย่าง: router.post('/x', requirePermission('users.manage'), handler)
const requirePermission = (key) => (req, res, next) => {
  const perms = (req.user && req.user.permissions) || [];
  if (perms.includes(key)) return next();
  return res.status(403).send({ error: { status: 403, message: `ไม่มีสิทธิ์ (${key})` } });
};

module.exports = requirePermission;
