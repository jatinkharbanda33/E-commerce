import express from "express";
import protectRoute from '../middlewares/protectRoute.js';
import { handlepayment } from "../controllers/paymentController.js";
const router=express.Router();
router.post("/makepayment/:id",protectRoute,handlepayment);
export default router;