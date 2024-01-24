import express from "express";
import protectRoute from '../middlewares/protectRoute.js';
import { addnewproduct,getaproduct,getProductItem } from "../controllers/productController.js";
const router=express.Router();
router.post("/addnewproduct",addnewproduct);
router.post("/getaproduct/:id",getaproduct);
router.post("/getproductitem/:id",getProductItem);

export default router;