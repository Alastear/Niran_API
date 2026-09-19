/**
 * กวาดไฟล์ในที่เก็บที่ไม่มีใครใช้แล้วทิ้ง
 *
 *   node scripts/cleanup-orphans.js                 # ดูอย่างเดียว ไม่ลบ
 *   node scripts/cleanup-orphans.js --apply         # ลบจริง (เว้นไฟล์ที่อัปใน 24 ชม.)
 *   node scripts/cleanup-orphans.js --apply --grace 1
 */
require('dotenv').config();
const { sweep } = require('../lib/orphans');

const apply = process.argv.includes('--apply');
const gi = process.argv.indexOf('--grace');
const parsed = gi !== -1 ? Number(process.argv[gi + 1]) : NaN;
const graceHours = Number.isFinite(parsed) && parsed >= 0 ? parsed : 24;
const MB = (b) => (b / 1048576).toFixed(1) + ' MB';

(async () => {
  const r = await sweep({ apply, graceHours });
  console.log(`ไฟล์ในที่เก็บ : ${r.totalObjects} ไฟล์ / ${MB(r.totalBytes)}`);
  console.log(`ใช้งานอยู่จริง: ${r.referenced} url`);
  console.log(`ข้ามไฟล์ใหม่  : ${r.skippedRecent} ไฟล์ (อัปภายใน ${graceHours} ชม.)`);
  console.log(`ไฟล์กำพร้า    : ${r.orphans} ไฟล์ / ${MB(r.orphanBytes)}`);
  if (r.items.length) {
    console.log('\nตัวอย่าง 10 ไฟล์แรก:');
    r.items.slice(0, 10).forEach((o) => console.log(`  ${MB(o.size).padStart(10)}  ${o.key}`));
  }
  console.log(apply ? `\nลบแล้ว ${r.deleted} ไฟล์ (คืนพื้นที่ ${MB(r.orphanBytes)})`
                    : '\n[ดูอย่างเดียว] สั่งลบจริงด้วย --apply');
})().catch((e) => { console.error('ERR:', e.message); process.exit(1); });
