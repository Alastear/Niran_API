const express = require('express');
const router = express.Router();
const CarVideoController = require('../Controllers/CarVideo.Controller');

/**
 * @swagger
 * tags:
 *   - name: Upload
 *     description: ออก token ให้ browser อัปโหลดไฟล์ใหญ่ตรงเข้า Vercel Blob
 */

/**
 * @swagger
 * /api/upload/car-video/token:
 *   post:
 *     summary: ขอ client token สำหรับอัปโหลดวิดีโอรถตรงเข้า Vercel Blob
 *     description: |
 *       เรียกโดย `upload()` ของ `@vercel/blob/client` เท่านั้น (ไม่ได้เรียกเอง)
 *       เนื่องจาก SDK ส่ง header ไม่ได้ ให้แนบ access token มาใน `clientPayload`
 *       เป็น JSON string `{"token":"<access_token>","car_id":1}`
 *       ผู้ใช้ต้องมีสิทธิ์ `cars.edit` — วิดีโอจำกัด 200MB/ไฟล์ ชนิด mp4/mov/webm
 *     tags: [Upload]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: body ที่ @vercel/blob/client สร้างให้อัตโนมัติ
 *             properties:
 *               type:
 *                 type: string
 *                 example: blob.generate-client-token
 *               payload:
 *                 type: object
 *     responses:
 *       200:
 *         description: ได้ clientToken สำหรับอัปโหลด
 *       401:
 *         description: token ไม่ถูกต้อง
 *       403:
 *         description: ไม่มีสิทธิ์ cars.edit
 */
router.post('/car-video/token', CarVideoController.car_video_token);

module.exports = router;
