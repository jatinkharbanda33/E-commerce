import express from "express";
import protectRoute from '../middlewares/protectRoute.js';
import { addproducts, getproductstatus } from "../controllers/orderController.js";
const router=express.Router();
router.post("/addproducts/:id",protectRoute,addproducts);
router.post("/getproductstatus",protectRoute,getproductstatus)
export default router;