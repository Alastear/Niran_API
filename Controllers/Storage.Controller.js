const { sweep } = require('../lib/orphans');
const r2 = require('../lib/r2');

// อ่านค่า grace แบบยอมรับ 0 ได้ — `Number(v) || 24` จะเปลี่ยน 0 เป็น 24 เพราะ 0 เป็น falsy
// ซึ่งทำให้สั่ง "กวาดทุกไฟล์เดี๋ยวนี้" ไม่ได้เลย
function graceOf(v, fallback = 24) {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : fallback;
}

module.exports = {
  // GET /api/admin/storage/usage — ดูว่าที่เก็บใช้ไปเท่าไหร่ มีขยะค้างเท่าไหร่
  get_usage: async (req, res, next) => {
    try {
      if (!r2.isConfigured()) return next(require('http-errors')(503, 'ยังไม่ได้ตั้งค่าที่เก็บไฟล์'));
      const r = await sweep({ apply: false, graceHours: graceOf(req.query.grace) });
      res.send({
        total_files: r.totalObjects,
        total_bytes: r.totalBytes,
        referenced_urls: r.referenced,
        orphan_files: r.orphans,
        orphan_bytes: r.orphanBytes,
        skipped_recent: r.skippedRecent,
      });
    } catch (error) { console.log(error.message); next(error); }
  },

  // POST /api/admin/storage/cleanup — ลบไฟล์กำพร้าทิ้ง
  cleanup: async (req, res, next) => {
    try {
      if (!r2.isConfigured()) return next(require('http-errors')(503, 'ยังไม่ได้ตั้งค่าที่เก็บไฟล์'));
      const graceHours = graceOf(req.body?.grace_hours);
      const r = await sweep({ apply: true, graceHours });
      res.send({
        status: 'success',
        deleted_files: r.deleted,
        freed_bytes: r.orphanBytes,
        skipped_recent: r.skippedRecent,
        remaining_files: r.totalObjects - r.deleted,
      });
    } catch (error) { console.log(error.message); next(error); }
  },
};
