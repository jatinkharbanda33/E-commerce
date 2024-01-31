import express from "express";
import protectRoute from '../middlewares/protectRoute.js';
import {getproductsoforder, getuserorders } from "../controllers/orderController.js";
const router=express.Router();
router.post("/getuserorders",protectRoute,getuserorders)
router.post("/getproductsoforder/:id",protectRoute,getproductsoforder)
export default router;