import express from "express";
import * as toppingsController from "../controllers/toppingsController.js";

const router = express.Router();

router.get('/toppings', toppingsController.getAllToppings);
router.get('/toppings/:id', toppingsController.getToppingById);
router.get('/toppings/category/:category', toppingsController.getToppingsByCategory);
router.post('/toppings', toppingsController.postTopping);
router.put('/toppings/:id', toppingsController.putTopping);
router.delete('/toppings/:id', toppingsController.deleteTopping);

export default router;