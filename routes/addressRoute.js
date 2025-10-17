import express from "express";
import * as addressController from "../controllers/addressController.js";

const router = express.Router();

router.get('/addresses', addressController.getAllAddresses);
router.get('/addresses/:id', addressController.getAddressById);
router.get('/addresses/user/:id', addressController.getAddressesByUserId);
router.post('/addresses', addressController.postAddress);
router.put('/addresses/:id', addressController.putAddress);
router.delete('/addresses/:id', addressController.deleteAddress);

export default router;