const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");

const CarStoreController = require('../Controllers/CarStore.Controller');
const MasterDataController = require('../Controllers/MasterData.Controller');

/**
 * @swagger
 * tags:
 *   - name: Store - Cars
 *     description: ดูข้อมูลรถยนต์ (สาธารณะ)
 *   - name: Store - Brands
 *     description: ดูข้อมูลยี่ห้อรถ (สาธารณะ)
 *   - name: Store - Models
 *     description: ดูข้อมูลรุ่นรถ (สาธารณะ)
 *   - name: Store - Car Detail
 *     description: ดูข้อมูลสเปครถ (สาธารณะ)
 */

/**
 * @swagger
 * /api/store/cars:
 *   get:
 *     summary: ดูรายการรถทั้งหมด
 *     tags: [Store - Cars]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema: { type: integer, example: 0 }
 *         description: หน้าที่ต้องการ (เริ่มที่ 0)
 *       - in: query
 *         name: size
 *         schema: { type: integer, example: 10 }
 *         description: จำนวนรายการต่อหน้า
 *       - in: query
 *         name: updateDate
 *         schema: { type: integer, enum: [1] }
 *         description: เรียงตาม updateDate ล่าสุด (ส่งค่า 1)
 *       - in: query
 *         name: createDate
 *         schema: { type: integer, enum: [1] }
 *         description: เรียงตาม createDate ล่าสุด (ส่งค่า 1)
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
router.get('/cars', CarStoreController.get_all_car_store);

/**
 * @swagger
 * /api/store/cars/{id}:
 *   get:
 *     summary: ดูข้อมูลรถตาม ID
 *     tags: [Store - Cars]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *         description: ID (เลข integer) ของรถ
 *     responses:
 *       200:
 *         description: ข้อมูลรถ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarStore'
 */
router.get('/cars/:id', CarStoreController.get_car_by_id);

/**
 * @swagger
 * /api/store/models:
 *   get:
 *     summary: ดูรายการรุ่นรถทั้งหมด
 *     tags: [Store - Models]
 *     responses:
 *       200:
 *         description: รายการรุ่นรถ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Model'
 */
router.get('/models', MasterDataController.Model_Api.get_all_model);

/**
 * @swagger
 * /api/store/models/{id}:
 *   get:
 *     summary: ดูข้อมูลรุ่นรถตาม ID
 *     tags: [Store - Models]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: ข้อมูลรุ่นรถ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Model'
 */
router.get('/models/:id', MasterDataController.Model_Api.get_model_by_id);

/**
 * @swagger
 * /api/store/brands:
 *   get:
 *     summary: ดูรายการยี่ห้อรถทั้งหมด
 *     tags: [Store - Brands]
 *     responses:
 *       200:
 *         description: รายการยี่ห้อรถ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Brand'
 */
router.get('/brands', MasterDataController.Brand_Api.get_all_brand);

/**
 * @swagger
 * /api/store/brands/{id}:
 *   get:
 *     summary: ดูข้อมูลยี่ห้อรถตาม ID
 *     tags: [Store - Brands]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer, example: 1 }
 *     responses:
 *       200:
 *         description: ข้อมูลยี่ห้อรถ
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Brand'
 */
router.get('/brands/:id', MasterDataController.Brand_Api.get_brand_by_id);

/**
 * @swagger
 * /api/store/car/detail:
 *   get:
 *     summary: ดูรายการสเปครถทั้งหมด
 *     tags: [Store - Car Detail]
 *     responses:
 *       200:
 *         description: รายการสเปครถ
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CarDetail'
 */
router.get('/car/detail', MasterDataController.Car_Detail_Api.get_all_car_detail);

/**
 * @swagger
 * /api/store/contact:
 *   get:
 *     summary: ดึงข้อมูลติดต่อ/เต๊นท์รถ (สาขา, โซเชียล, QR)
 *     tags: [Store - Contact]
 *     responses:
 *       200:
 *         description: ข้อมูลติดต่อ (object เดียว — ถ้ายังไม่ตั้งค่าจะได้ {})
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/contact', MasterDataController.Contact_Api.get_contact);

module.exports = router;
