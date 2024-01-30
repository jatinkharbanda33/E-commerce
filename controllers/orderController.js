import { getDb } from "../mysqlConnect/connectToDb.js";

const addproducts=async(req,res)=>{
    try{
        const shop_order_id=req.params.id;
        if(!shop_order_id) return res.status(400).json({error:"Invalid Request"});
        const userId=req.user.id;
        const db =await getDb();
        const[products,productsfield]=await db.query("SELECT * FROM shopping_cart_item WHERE shopping_cart_id=(SELECT shopping_cart_id FROM shop_order WHERE id=?)",[shop_order_id]);
        for(let i=0;i<products.length;i++){
            await db.query("INSERT INTO trackingstatus(user_id,product_id,order_id,quantity) VALUES(?,?,?,?)",[userId,products[i].product_id,shop_order_id,products[i].quantity]);
        }
        return res.status(200).json({message:"Order Placed Successfully"});
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
}
const getproductstatus=async(req,res)=>{
    try{
        const shop_order_id=req.query.orderid;
        const product_id=req.query.productid;
        if(!shop_order_id || !product_id) return res.status(400).json({error:"Invalid Request"});
        const db=await getDb();
        const [result,resultfields]=await db.query("SELECT status from trackingstatus WHERE product_id=? AND order_id=?",[product_id,shop_order_id]);
        if(result.length==0) return res.status(200).json({error:"Invalid request"});
        return res.status(200).json({status:result[0].status});
    }
    catch(err){
        return res.status(500).json({error:err.message});

    }
}
export {addproducts,getproductstatus};