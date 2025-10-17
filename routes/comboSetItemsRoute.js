import express from "express";
import * as comboSetItemsController from "../controllers/comboSetItemsController.js";

const router = express.Router();

router.get('/combo-set-items', comboSetItemsController.getAllComboSetItems);
router.get('/combo-set-items/combo/:id', comboSetItemsController.getComboSetItemsByComboId);
router.post('/combo-set-items', comboSetItemsController.postComboSetItem);
router.put('/combo-set-items/:id', comboSetItemsController.putComboSetItem);
router.delete('/combo-set-items/:id', comboSetItemsController.deleteComboSetItem);

export default router;