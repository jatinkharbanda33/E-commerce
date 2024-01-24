import { getDb } from "../mysqlConnect/connectToDb.js";
const addtoCart=async(req,res)=>{
    try{
        const db=await getDb();
        const user_id=req.user.id;
        const {product_id,quantity}=req.body;
        const [productItem,fields]=await db.query("SELECT * FROM product_item WHERE product_id=?",[product_id]);
        console.log(productItem[0]);
        if(productItem[0].quantity<quantity) return res.status(400).json({error:"Invalid Item Quantity"});
        const [haveCart,cartfields]=await db.query("SELECT * FROM shopping_cart WHERE user_id=? AND status=0",[user_id]);
        if(haveCart.length==0){
            const [newCart,newcartfields]=await db.query("INSERT INTO shopping_cart(user_id,product_count,cart_value) VALUES(?,?,?)",[user_id,quantity,quantity*productItem[0].price]);
            await db.query("INSERT INTO shopping_cart_item (product_id,quantity,shopping_cart_id) VALUES(?,?,?)",[product_id,quantity,newCart.insertId]);
        }
        
        else{
            await db.query("UPDATE  shopping_cart SET product_count=product_count+?,cart_value=cart_value+? WHERE id=? ",[quantity,productItem[0].price*quantity,haveCart[0].id]);
            await db.query("INSERT INTO shopping_cart_item (product_id,quantity,shopping_cart_id) VALUES(?,?,?)",[product_id,quantity,haveCart[0].id]);
            
        }
        await db.query("UPDATE  product_item SET quantity=quantity-? WHERE product_id=?",[quantity,product_id]);
        console.log(haveCart[0]);
        return res.status(200).json({message:"ADDED TO CART"});
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }

}
export {addtoCart};