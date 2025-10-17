import express from "express";

import productRoute from "./productRoute.js";
import comboSetItemsRoutes from "./comboSetItemsRoute.js";
import comboSetsRoutes from "./comboSetsRoute.js";
import promotionRoutes from "./promotionRoute.js";
import orderRoute from "./orderRoute.js";
import orderItemRoute from "./orderItemRoute.js";
import toppingsRoute from "./toppingsRoute.js";
import addressRoute from "./addressRoute.js";

const router = express.Router();

router.use(productRoute);
router.use(comboSetItemsRoutes);
router.use(comboSetsRoutes);
router.use(promotionRoutes);
router.use(orderRoute);
router.use(orderItemRoute);
router.use(toppingsRoute);
router.use(addressRoute);

export default router;