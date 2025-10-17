import express from "express";
import * as comboSetsController from "../controllers/comboSetsController.js";

const router = express.Router();

router.get('/combo-sets', comboSetsController.getAllComboSets);
router.get('/combo-sets/:id', comboSetsController.getComboSetById);
router.post('/combo-sets', comboSetsController.postComboSet);
router.put('/combo-sets/:id', comboSetsController.putComboSet);
router.delete('/combo-sets/:id', comboSetsController.deleteComboSet);

export default router;