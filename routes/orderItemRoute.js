import express from "express";
import * as orderItemController from "../controllers/orderItemController.js";

const router = express.Router();

router.get('/order-items', orderItemController.getAllOrderItems);
router.get('/order-items/:id', orderItemController.getOrderItemById);
router.get('/order-items/order/:id', orderItemController.getOrderItemsByOrderId);
router.post('/order-items', orderItemController.postOrderItem); //การจะเพิ่มข้อมูลต้องมี order_id เเละ product_id ด้วย
router.put('/order-items/:id', orderItemController.putOrderItem);
router.delete('/order-items/:id', orderItemController.deleteOrderItem);

export default router;