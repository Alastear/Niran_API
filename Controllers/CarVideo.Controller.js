const { handleUpload } = require('@vercel/blob/client');
const { del } = require('@vercel/blob');
const createError = require('http-errors');
const { eq } = require('drizzle-orm');
const { db, schema } = require('../database/db');
const { resolveUserFromToken } = require('../middleware/auth');
const { serializeCar } = require('./CarStore.Controller');

const carStore = schema.carStore;

// วิดีโอไฟล์ใหญ่เกิน body limit ของ serverless function (~4.5MB)
// จึงให้ browser อัปโหลดตรงเข้า Vercel Blob แล้วค่อยส่ง url กลับมาผูกกับรถ
const MAX_VIDEO_BYTES = 200 * 1024 * 1024; // 200MB / ไฟล์
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-m4v'];

module.exports = {
  MAX_VIDEO_BYTES,

  // ── POST /api/upload/car-video/token ──
  // route นี้ "ไม่" อยู่หลัง middleware auth เพราะ Vercel Blob client SDK
  // ส่ง header เองไม่ได้ — access token จึงมากับ clientPayload แล้วตรวจตรงนี้
  car_video_token: async (req, res, next) => {
    try {
      const result = await handleUpload({
        request: req,
        body: req.body,
        onBeforeGenerateToken: async (pathname, clientPayload) => {
          let payload = {};
          try {
            payload = JSON.parse(clientPayload || '{}');
          } catch (e) {
            throw createError(400, 'Invalid clientPayload');
          }
          if (!payload.token) throw createError(403, 'A token is required for authentication');

          let user;
          try {
            user = await resolveUserFromToken(payload.token);
          } catch (e) {
            throw createError(401, 'Invalid Token');
          }
          if (!user) throw createError(401, 'Invalid User');
          if (!user.permissions.includes('cars.edit')) throw createError(403, 'Forbidden: missing cars.edit');

          const carId = Number(payload.car_id);
          if (Number.isNaN(carId)) throw createError(400, 'Invalid car id');
          const [car] = await db.select({ _id: carStore._id }).from(carStore).where(eq(carStore._id, carId));
          if (!car) throw createError(404, 'Product does not exist');

          return {
            allowedContentTypes: ALLOWED_VIDEO_TYPES,
            maximumSizeInBytes: MAX_VIDEO_BYTES,
            addRandomSuffix: true,
            tokenPayload: JSON.stringify({ car_id: carId, user_id: user.user_id }),
          };
        },
        // ไม่ผูก DB ตรงนี้ เพราะ callback นี้ยิงจาก Vercel มาที่ public URL
        // (ตอน dev บน localhost จะไม่ถูกเรียก) — FE จะเรียก /attach ต่อเองหลังอัปโหลดเสร็จ
      });
      res.send(result);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  // ── POST /api/admin/update/cars/video/:id ── ผูก url ที่อัปโหลดแล้วเข้ากับรถ
  attach_car_video: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return next(createError(400, 'Invalid Product Id'));
      const { url, name, size } = req.body ?? {};
      if (!url || typeof url !== 'string') return next(createError(422, 'url is required'));

      const [car] = await db.select().from(carStore).where(eq(carStore._id, id));
      if (!car) throw createError(404, 'Product does not exist');

      // กัน url ปลอม: ต้องเป็น blob url ที่อยู่ใต้ path ของรถคันนี้
      if (!/^https:\/\/[a-z0-9]+\.public\.blob\.vercel-storage\.com\//i.test(url) || !url.includes(`/Category/${id}/video/`)) {
        return next(createError(422, 'Invalid blob url for this car'));
      }

      const videos = Array.isArray(car.cars_video) ? car.cars_video : [];
      if (videos.some((v) => v.url === url)) return res.send(serializeCar(car, req));
      videos.push({ url, name: name || 'video', size: Number(size) || 0, uploadedAt: new Date().toISOString() });

      const [result] = await db.update(carStore)
        .set({ cars_video: videos, updateDate: new Date() })
        .where(eq(carStore._id, id))
        .returning();
      res.send(serializeCar(result, req));
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },

  // ── POST /api/admin/delete/cars/video/:id ── ลบ url ออกจากรถ + ลบไฟล์ใน Blob
  delete_car_video: async (req, res, next) => {
    try {
      const id = Number(req.params.id);
      if (Number.isNaN(id)) return next(createError(400, 'Invalid Product Id'));
      const { url } = req.body ?? {};
      if (!url) return next(createError(422, 'url is required'));

      const [car] = await db.select().from(carStore).where(eq(carStore._id, id));
      if (!car) throw createError(404, 'Product does not exist');

      const videos = Array.isArray(car.cars_video) ? car.cars_video : [];
      if (!videos.some((v) => v.url === url)) return next(createError(404, 'Video not found on this car'));

      await del(url);
      const [result] = await db.update(carStore)
        .set({ cars_video: videos.filter((v) => v.url !== url), updateDate: new Date() })
        .where(eq(carStore._id, id))
        .returning();
      res.send(serializeCar(result, req));
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  },
};
