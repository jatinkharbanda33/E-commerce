import { getDb } from "../mysqlConnect/connectToDb.js";

const getuserorders=async(req,res)=>{
    try{
        const db=await getDb();
        const userid=req.user.id;
        const limit=req.query.limit || 10;
        const skip=req.query.skip || 0;
        const [orders,ordersfields]=await db.query("SELECT id,product_count,cart_value,address_id,order_date,order_status_id from shopping_cart WHERE status=1 AND user_id=? ORDER BY id DESC LIMIT ? OFFSET ?",[userid,limit,skip]);
        return res.status(200).json(orders);
    }
    catch(err){
        return res.status(500).json({error:err.message});

    }
}
const getproductsoforder=async(req,res)=>{
    try{
        const shopping_cart_id=req.params.id;
        const userid=req.user.id;
        const db=await getDb();
        const [products,productsfields]=await db.query("SELECT a.product_id, a.quantity FROM shopping_cart_item a JOIN shopping_cart b ON a.shopping_cart_id = b.id WHERE b.status = 1 AND b.user_id = ? AND b.id = ?",[userid,shopping_cart_id]);
        if(products.length==0){
            return res.status(400).json({error:"Invalid Request"});
        }
        return res.status(200).json(products);  
    }
    catch(err){
        return res.status(500).json({error:err.message});

    }
}
export {getuserorders,getproductsoforder};