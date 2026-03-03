<<<<<<< HEAD
const router = require('express').Router();
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middleware/auth.middleware');
const { authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', authLimiter, authController.register);
router.post('/login', authLimiter, authController.login);

router.get('/me', requireAuth, authController.me);
router.post('/logout', requireAuth, authController.logout);

module.exports = router;
=======
const router = require("express").Router(); 
const authController = require("../controllers/auth.controller"); 
const { requireAuth } = require("../middleware/auth.middleware"); 
 
/** 
* @swagger 
* tags: 
*   - name: Auth 
*     description: Registracija, prijava i autentifikacija 
*/ 
 
/** 
* @swagger 
* /api/auth/register: 
*   post: 
*     tags: [Auth] 
*     summary: Registracija korisnika 
*     requestBody: 
*       required: true 
*       content: 
*         application/json: 
*           schema: 
*             $ref: '#/components/schemas/AuthRegisterRequest' 
*     responses: 
*       201: 
*         description: Uspešna registracija 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/AuthResponse' 
*       400: 
*         description: Neispravni podaci 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       409: 
*         description: Email već postoji 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       500: 
*         description: Greška pri registraciji 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.post("/register", authController.register); 
 
/** 
* @swagger 
* /api/auth/login: 
*   post: 
*     tags: [Auth] 
*     summary: Login korisnika 
*     requestBody: 
*       required: true 
*       content: 
*         application/json: 
*           schema: 
*             $ref: '#/components/schemas/AuthLoginRequest' 
*     responses: 
*       200: 
*         description: Uspešan login 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/AuthResponse' 
*       400: 
*         description: Neispravni podaci 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       401: 
*         description: Pogrešan email ili lozinka 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       500: 
*         description: Greška pri login-u 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.post("/login", authController.login); 
 
/** 
* @swagger 
* /api/auth/me: 
*   get: 
*     tags: [Auth] 
*     summary: Trenutno ulogovani korisnik 
*     security: 
*       - bearerAuth: [] 
*     responses: 
*       200: 
*         description: Podaci o korisniku 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MeResponse' 
*       401: 
*         description: Niste ulogovani 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.get("/me", requireAuth, authController.me); 
 
/** 
* @swagger 
* /api/auth/logout: 
*   post: 
*     tags: [Auth] 
*     summary: Logout (simbolično – token je stateless) 
*     security: 
*       - bearerAuth: [] 
*     responses: 
*       200: 
*         description: Logout uspešan 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*       401: 
*         description: Niste ulogovani 
*         content: 
*           application/json: 
*             schema: 
*               $ref: '#/components/schemas/MessageResponse' 
*/ 
router.post("/logout", requireAuth, authController.logout); 
 
module.exports = router; 
>>>>>>> e8ea821 (Dodata swagger dokumentacija i izmena ruta)
