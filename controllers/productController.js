import { response } from "express";
import { getDb } from "../mysqlConnect/connectToDb.js";
const getaproduct=async(req,res)=>{
    try{
        const db=await getDb();
        const product_id=String(req.params.id);
        const [product,fields]=await db.query("SELECT * FROM product WHERE product_id=?",[product_id]);
        if(product.length==0) return res.status(400).json({error:"Invalid Product Id"});
        console.log(product[0]);
        return res.status(200).json(product[0]);
    }
    catch(err){
        return res.status(200).json({ error: err.message });

    }
}
const addnewproduct=async(req,res)=>{
    try{
        const db=await getDb();
        const {name,category,image,description,price,quantity}=req.body;
        console.log(name);
        const [newproduct,itfields]=await db.query("INSERT INTO product(category_id,name,description,product_image) VALUES(?,?,?,?)",[category,name,description,image]);
      
        await db.query("INSERT INTO product_item(product_id,quantity,price) VALUES(?,?,?)",[newproduct.insertId,quantity,price]);
        return res.status(200).json({message:"Product Added Successfully"});
    }
    catch(err){
        return res.status(200).json({ error: err.message });

    }
}
const getProductItem=async(req,res)=>{
    try{
        const db=await getDb();
        const productid=req.params.id;
        const [productitem,fields]=await db.query("SELECT * FROM  product a  JOIN product_item b ON a.id=b.product_id  WHERE product_id=?",[productid]);
        console.log(productitem[0]);
        return res.status(200).json(productitem[0]);
    }
    catch(err){
        return res.status(200).json({ error: err.message });

    }
}
const getproductsbycategory=async(req,res)=>{
    try{
        const skip=parseInt(req.query.skip) || 0;
        const limit=(req.query.limit) || 40;
        const category_name=req.query.category;
        if(!category_name) return res.status(400).json({message:"Invalid category name"});
        const [items,itemsfields]=await db.query("SELECT a.name,a.product_image,c.price FROM product a JOIN category b ON a.category_id=b.id AND b.name=?  LEFT JOIN product_item c ON a.id=c.product_id ORDER BY c.price OFFSET ? LIMIT ?",[category_name,skip,limit]);
        console.log(items);
        return res.status(200).json(items);


    }
    catch(err){
        return res.status(200).json({ error: err.message });

    }
}

export {addnewproduct,getaproduct,getProductItem,getproductsbycategory};