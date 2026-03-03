const router = require("express").Router();
const { health } = require("../controllers/health.controller");

/**
 * @swagger
 * tags:
 *   - name: Health
 *     description: Provera rada API-ja
 */

/**
 * @swagger
 * /api/health:
 *   get:
 *     tags: [Health]
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API radi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/HealthResponse'
 */
router.get("/", health);

module.exports = router;
