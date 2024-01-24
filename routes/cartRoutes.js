import express from "express";
import protectRoute from '../middlewares/protectRoute.js';
import {addtoCart} from '../controllers/cartController.js';
const router=express.Router();
router.post("/addtoCart",protectRoute,addtoCart);

export default router;