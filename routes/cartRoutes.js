import express from "express";
import protectRoute from '../middlewares/protectRoute.js';
import {addtoCart, deletefromCart, updatecartitemquantity} from '../controllers/cartController.js';
const router=express.Router();
router.post("/addtoCart",protectRoute,addtoCart);
router.post("/deletefromcart",protectRoute,deletefromCart);
router.post("/updatecartitemquantity/:id",protectRoute,updatecartitemquantity);
export default router;