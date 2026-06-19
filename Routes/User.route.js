const express = require('express');
const router = express.Router();
const auth = require("../middleware/auth");
const auth_refreshToken = require("../middleware/auth_refreshToken");
const authAdmin = require("../middleware/authAdmin");
const UserController = require('../Controllers/User.Controller');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: ล็อกอินและรีเฟรช token
 */

/**
 * @swagger
 * /api/user/login:
 *   post:
 *     summary: เข้าสู่ระบบ
 *     tags: [Auth]
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
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: ล็อกอินสำเร็จ ได้รับ access_token และ refresh_token
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *       404:
 *         description: username หรือ password ไม่ถูกต้อง
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', UserController.user_login);

/**
 * @swagger
 * /api/user/refresh/token:
 *   post:
 *     summary: รีเฟรช access token
 *     tags: [Auth]
 *     description: ต้องส่ง refresh_token ใน header `x-access-token`
 *     security:
 *       - AccessToken: []
 *     responses:
 *       200:
 *         description: ได้รับ access_token และ refresh_token ใหม่
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 result:
 *                   $ref: '#/components/schemas/User'
 *                 access_token:
 *                   type: string
 *                 refresh_token:
 *                   type: string
 *       401:
 *         description: Token ไม่ถูกต้องหรือหมดอายุ
 */
router.post('/refresh/token', auth_refreshToken, UserController.user_refresh_login);

module.exports = router;
