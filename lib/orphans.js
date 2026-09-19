// ── กวาดไฟล์กำพร้าในที่เก็บ ────────────────────────────────────────────────
// hook ลบไฟล์ตอนลบรถ/เปลี่ยนรูป ครอบคลุมเคสปกติหมดแล้ว แต่ยังมีทางหลุดอยู่:
//   1. อัปวิดีโอด้วย presigned URL แล้วปิดแท็บก่อนระบบผูกไฟล์เข้ารถ (ไฟล์ค้างทันที)
//   2. อัปไฟล์ขึ้นสำเร็จแต่เขียนฐานข้อมูลพลาด
//   3. มีคนลบแถวในฐานข้อมูลตรง ๆ
// ตัวนี้เทียบไฟล์ในที่เก็บกับ url ที่ฐานข้อมูลอ้างถึงจริง แล้วลบส่วนเกินทิ้ง
const { ListObjectsV2Command, DeleteObjectsCommand } = require('@aws-sdk/client-s3');
const { db, schema } = require('../database/db');
const r2 = require('./r2');

/** รวบรวม url ทุกอันที่ฐานข้อมูลอ้างถึงอยู่ */
async function collectReferenced() {
  const used = new Set();
  const cars = await db.select({
    d: schema.carStore.cars_image_default,
    g: schema.carStore.cars_image,
    v: schema.carStore.cars_video,
  }).from(schema.carStore);
  for (const c of cars) {
    if (c.d) used.add(c.d);
    (Array.isArray(c.g) ? c.g : []).forEach((u) => u && used.add(u));
    (Array.isArray(c.v) ? c.v : []).forEach((x) => x?.url && used.add(x.url));
  }
  for (const b of await db.select({ i: schema.masterBrand.brand_image }).from(schema.masterBrand)) {
    if (b.i) used.add(b.i);
  }
  for (const d of await db.select({ u: schema.documents.blob_url }).from(schema.documents)) {
    if (d.u) used.add(d.u);
  }
  return used;
}

/** ไล่ list ทุก object ใน bucket */
async function listAll() {
  const out = [];
  let token;
  do {
    const r = await r2.s3.send(new ListObjectsV2Command({
      Bucket: r2.BUCKET, ContinuationToken: token, MaxKeys: 1000,
    }));
    out.push(...(r.Contents || []));
    token = r.IsTruncated ? r.NextContinuationToken : undefined;
  } while (token);
  return out;
}

/**
 * หา (และลบ) ไฟล์กำพร้า
 * @param {object} opt
 * @param {boolean} opt.apply      true = ลบจริง, false = แค่รายงาน
 * @param {number}  opt.graceHours ไม่แตะไฟล์ที่เพิ่งอัปภายในกี่ชั่วโมง (กันลบไฟล์ที่กำลังอัปอยู่)
 */
async function sweep({ apply = false, graceHours = 24 } = {}) {
  const [objects, used] = await Promise.all([listAll(), collectReferenced()]);
  const cutoff = Date.now() - graceHours * 3600 * 1000;

  // กันพลาดร้ายแรง: ถ้าฐานข้อมูลไม่อ้างถึงอะไรเลยทั้งที่มีไฟล์อยู่ แปลว่าน่าจะอ่าน DB ไม่สำเร็จ
  // ถ้าปล่อยผ่านจะลบไฟล์ทั้ง bucket
  if (objects.length > 0 && used.size === 0) {
    throw new Error('ยกเลิก: ฐานข้อมูลไม่อ้างถึงไฟล์ใดเลย อาจอ่านข้อมูลไม่สำเร็จ');
  }

  const orphans = [];
  let skippedRecent = 0;
  for (const o of objects) {
    if (used.has(r2.publicUrl(o.Key))) continue;
    if (new Date(o.LastModified).getTime() > cutoff) { skippedRecent++; continue; }
    orphans.push({ key: o.Key, size: o.Size, lastModified: o.LastModified });
  }

  const bytes = orphans.reduce((s, o) => s + (o.size || 0), 0);
  const report = {
    totalObjects: objects.length,
    totalBytes: objects.reduce((s, o) => s + (o.Size || 0), 0),
    referenced: used.size,
    orphans: orphans.length,
    orphanBytes: bytes,
    skippedRecent,
    deleted: 0,
    applied: apply,
  };
  if (!apply || !orphans.length) return { ...report, items: orphans };

  for (let i = 0; i < orphans.length; i += 1000) {
    const chunk = orphans.slice(i, i + 1000);
    await r2.s3.send(new DeleteObjectsCommand({
      Bucket: r2.BUCKET,
      Delete: { Objects: chunk.map((o) => ({ Key: o.key })), Quiet: true },
    }));
    report.deleted += chunk.length;
  }
  return { ...report, items: orphans };
}

module.exports = { sweep, collectReferenced, listAll };
