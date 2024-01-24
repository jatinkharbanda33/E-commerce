import express from "express";
import protectRoute from '../middlewares/protectRoute.js';
import {addtoCart, deletefromCart} from '../controllers/cartController.js';
const router=express.Router();
router.post("/addtoCart",protectRoute,addtoCart);
router.post("/deletefromcart",protectRoute,deletefromCart);

export default router;