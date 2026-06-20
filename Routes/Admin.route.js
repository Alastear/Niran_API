const express = require('express');
const router = express.Router();
const multer = require("multer")

const authAdmin = require("../middleware/authAdmin");
const CarStoreController = require('../Controllers/CarStore.Controller');
const MasterDataController = require('../Controllers/MasterData.Controller');
const UserController = require('../Controllers/User.Controller');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage })

/**
 * @swagger
 * tags:
 *   - name: Admin - Cars
 *     description: จัดการข้อมูลรถ (ต้องล็อกอิน)
 *   - name: Admin - Brands
 *     description: จัดการยี่ห้อรถ (ต้องล็อกอิน)
 *   - name: Admin - Models
 *     description: จัดการรุ่นรถ (ต้องล็อกอิน)
 *   - name: Admin - Car Detail
 *     description: จัดการสเปครถ (ต้องล็อกอิน)
 *   - name: Admin - Users
 *     description: จัดการผู้ใช้ (เฉพาะ ADMIN เท่านั้น)
 */

// ──────────────────────────────────────────────
// Cars
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/create/cars:
 *   post:
 *     summary: สร้างรายการรถใหม่
 *     tags: [Admin - Cars]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [cars_title, brand_name, model_name, cars_detail, image]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพหลักของรถ
 *               cars_title:
 *                 type: string
 *                 example: Toyota Camry 2024
 *               brand_name:
 *                 type: string
 *                 example: Toyota
 *               model_name:
 *                 type: string
 *                 example: Camry
 *               cars_detail:
 *                 type: string
 *                 description: JSON string ของข้อมูลสเปค
 *                 example: '{"year":"2024","color":"ขาว","mileage":"50000"}'
 *               cars_subdetail:
 *                 type: string
 *                 description: JSON string ของรายละเอียดเพิ่มเติม (array)
 *                 example: '[]'
 *               cars_description:
 *                 type: string
 *               cars_tag:
 *                 type: string
 *     responses:
 *       200:
 *         description: สร้างรถสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarStore'
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 *       422:
 *         description: ข้อมูลไม่ครบหรือไม่ถูกต้อง
 */
router.post('/create/cars', upload.single('image'), CarStoreController.create_car_store);

/**
 * @swagger
 * /api/admin/update/cars/{id}:
 *   post:
 *     summary: อัปเดตข้อมูลรถ
 *     tags: [Admin - Cars]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *         description: ID (เลข integer) ของรถ
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: รูปภาพใหม่ (ถ้าต้องการเปลี่ยน)
 *               cars_image_default:
 *                 type: string
 *                 description: full Blob URL ของรูปเดิม (ส่งมาเพื่อให้ระบบลบรูปเก่าเมื่ออัปโหลดรูปใหม่)
 *                 example: https://xxxx.public.blob.vercel-storage.com/Category/Default/abc123.jpeg
 *               cars_title:
 *                 type: string
 *                 example: Toyota Camry 2024 (ปรับราคา)
 *               brand_name:
 *                 type: string
 *                 example: Toyota
 *               model_name:
 *                 type: string
 *                 example: Camry
 *               cars_detail:
 *                 type: string
 *                 description: JSON string ของข้อมูลสเปค
 *                 example: '{"year":"2024","color":"ดำ","mileage":"42000","price":"1390000"}'
 *               cars_subdetail:
 *                 type: string
 *                 description: JSON string (array)
 *                 example: '[{"label":"ประกัน","value":"ชั้น 1 ถึง 2025"}]'
 *               cars_description:
 *                 type: string
 *                 example: รถบ้านมือเดียว เข้าศูนย์ตลอด
 *               cars_status:
 *                 type: string
 *                 enum: [SELL, SOLD, BOOKING]
 *                 example: BOOKING
 *               cars_tag:
 *                 type: string
 *                 example: ป้ายแดง
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarStore'
 *       404:
 *         description: ไม่พบรถที่ระบุ
 */
router.post('/update/cars/:id', upload.single('image'), CarStoreController.update_car_store);

/**
 * @swagger
 * /api/admin/update/cars/image/gallery/{id}:
 *   post:
 *     summary: เพิ่มรูปภาพ gallery ให้รถ
 *     tags: [Admin - Cars]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [image, cars_image]
 *             properties:
 *               image:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: รูปภาพ gallery (สูงสุด 10 รูป)
 *               cars_image:
 *                 type: string
 *                 description: JSON array ของ full Blob URL รูปที่มีอยู่แล้ว (รูปใหม่จะถูก push ต่อท้าย)
 *                 example: '["https://xxxx.public.blob.vercel-storage.com/Category/1/existing.jpeg"]'
 *     responses:
 *       200:
 *         description: เพิ่มรูปสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarStore'
 */
router.post('/update/cars/image/gallery/:id', upload.array('image', 10), CarStoreController.update_car_store_image_gallery);

/**
 * @swagger
 * /api/admin/delete/cars/image/gallery/{id}:
 *   post:
 *     summary: ลบรูปภาพ gallery ออกจากรถ
 *     tags: [Admin - Cars]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cars_image_delete, cars_image]
 *             properties:
 *               cars_image_delete:
 *                 type: array
 *                 items: { type: string }
 *                 description: รายการ full Blob URL ที่ต้องการลบ
 *                 example: ["https://xxxx.public.blob.vercel-storage.com/Category/1/abc123.jpeg"]
 *               cars_image:
 *                 type: array
 *                 items: { type: string }
 *                 description: รายการ full Blob URL ที่เหลือหลังลบ
 *                 example: []
 *     responses:
 *       200:
 *         description: ลบรูปสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarStore'
 */
router.post('/delete/cars/image/gallery/:id', CarStoreController.delete_car_store_image_gallery);

/**
 * @swagger
 * /api/admin/delete/cars/{id}:
 *   get:
 *     summary: ลบรถ (เฉพาะ ADMIN)
 *     tags: [Admin - Cars]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarStore'
 *       403:
 *         description: ไม่มีสิทธิ์ ADMIN
 *       404:
 *         description: ไม่พบรถที่ระบุ
 */
router.get('/delete/cars/:id', authAdmin, CarStoreController.delete_car_store);

/**
 * @swagger
 * /api/admin/cars/all:
 *   get:
 *     summary: ดูรถทั้งหมด (สำหรับ admin)
 *     tags: [Admin - Cars]
 *     security:
 *       - AccessToken: []
 *     responses:
 *       200:
 *         description: รายการรถทั้งหมด
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CarStore'
 */
router.get('/cars/all', CarStoreController.get_all_car_store);

// ──────────────────────────────────────────────
// Models
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/create/model:
 *   post:
 *     summary: สร้างรุ่นรถใหม่
 *     tags: [Admin - Models]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [model_name, brand_name]
 *             properties:
 *               model_name:
 *                 type: string
 *                 example: Camry
 *               brand_name:
 *                 type: string
 *                 example: Toyota
 *               model_submodel:
 *                 type: array
 *                 items: { type: string }
 *                 example: ["2.0 G", "2.5 HV"]
 *               model_description:
 *                 type: string
 *     responses:
 *       200:
 *         description: สร้างสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Model'
 */
router.post('/create/model', MasterDataController.Model_Api.create_model)

/**
 * @swagger
 * /api/admin/update/model/{id}:
 *   post:
 *     summary: อัปเดตรุ่นรถ
 *     tags: [Admin - Models]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               model_name:
 *                 type: string
 *                 example: Camry
 *               brand_name:
 *                 type: string
 *                 example: Toyota
 *               model_submodel:
 *                 type: string
 *                 description: JSON string ของ array sub-model
 *                 example: '["2.0 G","2.5 HV","2.5 HV Premium"]'
 *               model_description:
 *                 type: string
 *                 example: รุ่นปรับโฉมปี 2024
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Model'
 *       404:
 *         description: ไม่พบรุ่นรถ
 */
router.post('/update/model/:id', MasterDataController.Model_Api.update_model)

/**
 * @swagger
 * /api/admin/delete/model/{id}:
 *   get:
 *     summary: ลบรุ่นรถ
 *     tags: [Admin - Models]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *       404:
 *         description: ไม่พบรุ่นรถ
 */
router.get('/delete/model/:id', MasterDataController.Model_Api.delete_model)

// ──────────────────────────────────────────────
// Brands
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/create/brand:
 *   post:
 *     summary: สร้างยี่ห้อรถใหม่
 *     tags: [Admin - Brands]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [brand_name]
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: โลโก้ยี่ห้อรถ
 *               brand_name:
 *                 type: string
 *                 example: Toyota
 *               brand_description:
 *                 type: string
 *                 example: แบรนด์รถยนต์จากญี่ปุ่น
 *     responses:
 *       200:
 *         description: สร้างสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 */
router.post('/create/brand', upload.single('image'), MasterDataController.Brand_Api.create_brand)

/**
 * @swagger
 * /api/admin/update/brand/{id}:
 *   post:
 *     summary: อัปเดตยี่ห้อรถ
 *     tags: [Admin - Brands]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     requestBody:
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 format: binary
 *                 description: โลโก้ใหม่ (ถ้าต้องการเปลี่ยน)
 *               brand_name:
 *                 type: string
 *                 example: Toyota
 *               brand_description:
 *                 type: string
 *                 example: แบรนด์รถยนต์จากญี่ปุ่น
 *               brand_image:
 *                 type: string
 *                 description: full Blob URL ของโลโก้เดิม (ส่งมาเพื่อให้ลบรูปเก่าเมื่ออัปโหลดรูปใหม่)
 *                 example: https://xxxx.public.blob.vercel-storage.com/Category/Brand/abc123
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 *       404:
 *         description: ไม่พบยี่ห้อรถ
 */
router.post('/update/brand/:id', upload.single('image'), MasterDataController.Brand_Api.update_brand)

/**
 * @swagger
 * /api/admin/delete/brand/{id}:
 *   get:
 *     summary: ลบยี่ห้อรถ
 *     tags: [Admin - Brands]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *       404:
 *         description: ไม่พบยี่ห้อรถ
 */
router.get('/delete/brand/:id', MasterDataController.Brand_Api.delete_brand)

/**
 * @swagger
 * /api/admin/brand/reorder:
 *   post:
 *     summary: จัดลำดับยี่ห้อรถใหม่ทั้งชุด
 *     tags: [Admin - Brands]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [ids]
 *             properties:
 *               ids:
 *                 type: array
 *                 items: { type: integer }
 *                 description: รายการ id ของยี่ห้อ เรียงตามลำดับที่ต้องการ
 *                 example: [24, 13, 3]
 *     responses:
 *       200:
 *         description: จัดลำดับสำเร็จ
 */
router.post('/brand/reorder', MasterDataController.Brand_Api.reorder_brand)

// ──────────────────────────────────────────────
// Car Detail
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/create/car/detail:
 *   post:
 *     summary: สร้างข้อมูลสเปครถใหม่
 *     tags: [Admin - Car Detail]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cardt_title, cardt_type]
 *             properties:
 *               cardt_title:
 *                 type: string
 *                 example: ระบบเครื่องยนต์
 *               cardt_type:
 *                 type: string
 *                 description: ประเภท/หมวดของสเปค
 *                 example: engine
 *               cardt_description:
 *                 type: string
 *                 example: เครื่องยนต์ 2.5L 4 สูบ เกียร์อัตโนมัติ 8 สปีด
 *     responses:
 *       200:
 *         description: สร้างสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarDetail'
 */
router.post('/create/car/detail', MasterDataController.Car_Detail_Api.create_car_detail)

/**
 * @swagger
 * /api/admin/update/car/detail/{id}:
 *   post:
 *     summary: อัปเดตสเปครถ
 *     tags: [Admin - Car Detail]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cardt_title:
 *                 type: string
 *                 example: ระบบเครื่องยนต์
 *               cardt_type:
 *                 type: string
 *                 example: engine
 *               cardt_description:
 *                 type: string
 *                 example: เครื่องยนต์ 2.5L 4 สูบ เกียร์อัตโนมัติ 8 สปีด
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarDetail'
 *       404:
 *         description: ไม่พบข้อมูล
 */
router.post('/update/car/detail/:id', MasterDataController.Car_Detail_Api.update_car_detail)

/**
 * @swagger
 * /api/admin/delete/car/detail/{id}:
 *   get:
 *     summary: ลบสเปครถ
 *     tags: [Admin - Car Detail]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *       404:
 *         description: ไม่พบข้อมูล
 */
router.get('/delete/car/detail/:id', MasterDataController.Car_Detail_Api.delete_car_detail)

// ──────────────────────────────────────────────
// Users (ADMIN only)
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/register:
 *   post:
 *     summary: สร้างผู้ใช้ใหม่ (เฉพาะ ADMIN)
 *     tags: [Admin - Users]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, password]
 *             properties:
 *               username:
 *                 type: string
 *                 example: staff01
 *               password:
 *                 type: string
 *                 example: "password123"
 *               position:
 *                 type: string
 *                 enum: [ADMIN, ""]
 *                 example: ""
 *     responses:
 *       200:
 *         description: สร้างผู้ใช้สำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: ไม่มีสิทธิ์ ADMIN
 */
router.post('/register', authAdmin, UserController.user_register);

/**
 * @swagger
 * /api/admin/user/all:
 *   get:
 *     summary: ดูรายการผู้ใช้ทั้งหมด (เฉพาะ ADMIN)
 *     tags: [Admin - Users]
 *     security:
 *       - AccessToken: []
 *     responses:
 *       200:
 *         description: รายการผู้ใช้ (ไม่แสดง password)
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 *       403:
 *         description: ไม่มีสิทธิ์ ADMIN
 */
router.get('/user/all', authAdmin, UserController.get_all_user);

/**
 * @swagger
 * /api/admin/update/user/{id}:
 *   post:
 *     summary: อัปเดตข้อมูลผู้ใช้ (เฉพาะ ADMIN)
 *     tags: [Admin - Users]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 example: staff01
 *               password:
 *                 type: string
 *                 description: ส่งมาเฉพาะเมื่อต้องการเปลี่ยนรหัสผ่าน
 *                 example: newpassword123
 *               email:
 *                 type: string
 *                 example: staff01@niran.com
 *               tel:
 *                 type: string
 *                 example: "0812345678"
 *               position:
 *                 type: string
 *                 enum: [ADMIN, ""]
 *                 example: ""
 *     responses:
 *       200:
 *         description: อัปเดตสำเร็จ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       403:
 *         description: ไม่มีสิทธิ์ ADMIN
 *       404:
 *         description: ไม่พบผู้ใช้ หรือ username ซ้ำ
 */
router.post('/update/user/:id', authAdmin, UserController.update_user);

/**
 * @swagger
 * /api/admin/delete/user/{id}:
 *   get:
 *     summary: ลบผู้ใช้ (เฉพาะ ADMIN)
 *     tags: [Admin - Users]
 *     security:
 *       - AccessToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: ลบสำเร็จ
 *       403:
 *         description: ไม่มีสิทธิ์ ADMIN
 *       404:
 *         description: ไม่พบผู้ใช้
 */
router.get('/delete/user/:id', authAdmin, UserController.delete_user)

// ──────────────────────────────────────────────
// Contact / site settings (เต๊นท์รถ)
// ──────────────────────────────────────────────

/**
 * @swagger
 * /api/admin/update/contact:
 *   post:
 *     summary: บันทึกข้อมูลติดต่อ/เต๊นท์รถทั้งก้อน (สาขา, โซเชียล, QR)
 *     tags: [Admin - Contact]
 *     security:
 *       - AccessToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               branches:
 *                 - title: สาขา 1 สาขาบ้านไร่
 *                   place: 191 ม.1 ต.ทัพหลวง อ.บ้านไร่ จ.อุทัยธานี
 *                   tel: ["081-9727551 เจ๊ชมพู่", "098-7536681 นุ้ย"]
 *                   map_link: https://maps.google.com/...
 *               socials:
 *                 - type: facebook
 *                   name: นิรันดร์คาร์เซ็นเตอร์
 *                   link: https://facebook.com/...
 *               line_qr: https://qr-official.line.me/gs/....png
 *     responses:
 *       200:
 *         description: บันทึกสำเร็จ (คืน object ที่บันทึก)
 *       401:
 *         description: ไม่มีสิทธิ์เข้าถึง
 */
router.post('/update/contact', MasterDataController.Contact_Api.update_contact);

module.exports = router;
