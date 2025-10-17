import express from "express";
import * as productController from "../controllers/productController.js";

const router = express.Router();

router.get('/products', productController.getAllProducts);
router.get('/products/categories', productController.getAllCategories);
router.get('/products/:id', productController.getProductById);
router.get('/products/:id/options', productController.getProductOptionsById);
router.get('/products/categories/:categoryName', productController.getProductsBycategories);
router.post('/products', productController.postProduct);
router.put('/products/:id', productController.putProduct);
router.delete('/products/:id', productController.deleteProduct);

export default router;