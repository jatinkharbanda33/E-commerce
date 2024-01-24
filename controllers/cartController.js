import { getDb } from "../mysqlConnect/connectToDb.js";
const addtoCart=async()=>{
    try{
        const db=await getDb();
        const user_id=req.user.id;
        const {product_id,quantity}=req.body;
        const [itemQuantity,fields]=await db.query("SELECT quantity FROM product_item WHERE product_id=?",[product_id]);
        if(itemQuantity[0].quantity<quantity) return res.status(400).json({error:"Invalid Item Quantity"});
        const [haveCart,cartfields]=await db.query("SELECT * FROM shopping_cart WHERE user_id=? AND status=0",[user_id]);
        
        
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }

}
export {addtoCart};