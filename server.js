import express from "express";
import dotenv from "dotenv";
dotenv.config();
const port=process.env.PORT;
import {connectToDb} from "./mysqlConnect/connectToDb.js";
import userRoutes from './routes/userRoutes.js';
import productRoutes from './routes/productRoute.js';
import paymentRoutes from './routes/paymentRoutes.js';
import cartRoutes from './routes/cartRoutes.js'
const app=express();
const PORT=process.env.PORT;
connectToDb();
//MiddleWares
app.use(express.json({limit:"50mb"}));
app.use(express.urlencoded({extended:true}));
app.use("/api/user",userRoutes);
app.use("/api/payment",paymentRoutes);
app.use("/api/product",productRoutes);
app.use("/api/cart",cartRoutes);
app.listen(port,()=>console.log(`Listening on port ${port}`));
