import express from "express";
import * as promotionController from "../controllers/promotionController.js";

const router = express.Router();

router.get('/promotions', promotionController.getAllPromotions);
router.get('/promotions/:id', promotionController.getPromotionById);
router.post('/promotions', promotionController.postPromotion);
router.put('/promotions/:id', promotionController.putPromotion);
router.delete('/promotions/:id', promotionController.deletePromotion);

export default router;