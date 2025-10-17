import express from "express";
import * as orderController from "../controllers/orderController.js";

const router = express.Router();

router.get('/orders', orderController.getAllOrders);
router.get('/orders/:id', orderController.getOrderById);
router.get('/orders/user/:id', orderController.getOrdersByUserId);
router.post('/orders', orderController.postOrder); //การจะเพิ่มข้อมูลต้องมี address_id เเละ user_id ด้วย
router.put('/orders/:id', orderController.putOrder); //id ที่ต้องใส่คือ order_id อิงจาก database
router.delete('/orders/:id', orderController.deleteOrder);

export default router;