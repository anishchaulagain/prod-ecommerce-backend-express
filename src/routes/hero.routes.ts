import { Router } from "express";
import * as HeroController from "../controllers/hero.controller";
import { authenticate, authorize } from "../middlewares/auth.middleware";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Hero
 *   description: Homepage hero slides management
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     HeroSlide:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         title:
 *           type: string
 *         subtitle:
 *           type: string
 *         imageUrl:
 *           type: string
 *         mobileImageUrl:
 *           type: string
 *         ctaText:
 *           type: string
 *         ctaLink:
 *           type: string
 *         order:
 *           type: integer
 *         isActive:
 *           type: boolean
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     CreateHeroSlide:
 *       type: object
 *       required:
 *         - title
 *         - imageUrl
 *       properties:
 *         title:
 *           type: string
 *         subtitle:
 *           type: string
 *         imageUrl:
 *           type: string
 *         mobileImageUrl:
 *           type: string
 *         ctaText:
 *           type: string
 *         ctaLink:
 *           type: string
 *         order:
 *           type: integer
 *           default: 0
 *         isActive:
 *           type: boolean
 *           default: true
 *     UpdateHeroOrder:
 *       type: object
 *       required:
 *         - orders
 *       properties:
 *         orders:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               order:
 *                 type: integer
 */

/**
 * @swagger
 * /api/v1/hero:
 *   post:
 *     summary: Create a new hero slide (Admin only)
 *     tags: [Hero]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHeroSlide'
 *     responses:
 *       201:
 *         description: Hero slide created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post("/", authenticate, authorize(["admin"]), HeroController.createHeroSlide);

/**
 * @swagger
 * /api/v1/hero:
 *   get:
 *     summary: Get all hero slides
 *     tags: [Hero]
 *     parameters:
 *       - in: query
 *         name: includeInactive
 *         schema:
 *           type: boolean
 *           default: false
 *         description: Include inactive slides (Admin only tool)
 *     responses:
 *       200:
 *         description: List of hero slides
 */
router.get("/", HeroController.getHeroSlides);

/**
 * @swagger
 * /api/v1/hero/sort:
 *   patch:
 *     summary: Update slides order (Admin only)
 *     tags: [Hero]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateHeroOrder'
 *     responses:
 *       200:
 *         description: Order updated successfully
 */
router.patch("/sort", authenticate, authorize(["admin"]), HeroController.updateSlidesOrder);

/**
 * @swagger
 * /api/v1/hero/{id}:
 *   get:
 *     summary: Get a hero slide by ID
 *     tags: [Hero]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hero slide details
 *       404:
 *         description: Slide not found
 */
router.get("/:id", HeroController.getHeroSlideById);

/**
 * @swagger
 * /api/v1/hero/{id}:
 *   patch:
 *     summary: Update a hero slide (Admin only)
 *     tags: [Hero]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateHeroSlide'
 *     responses:
 *       200:
 *         description: Hero slide updated successfully
 *       404:
 *         description: Slide not found
 */
router.patch("/:id", authenticate, authorize(["admin"]), HeroController.updateHeroSlide);

/**
 * @swagger
 * /api/v1/hero/{id}:
 *   delete:
 *     summary: Delete a hero slide (Admin only)
 *     tags: [Hero]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Hero slide deleted successfully
 *       404:
 *         description: Slide not found
 */
router.delete("/:id", authenticate, authorize(["admin"]), HeroController.deleteHeroSlide);

export default router;

