import { response } from "express";
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
        let newShopingCartItemId;
        if(haveCart.length==0){
            const [newCart,newcartfields]=await db.query("INSERT INTO shopping_cart(user_id,product_count,cart_value) VALUES(?,?,?)",[user_id,quantity,quantity*productItem[0].price]);
            const [addedItem,addedItemfields]=await db.query("INSERT INTO shopping_cart_item (product_id,quantity,shopping_cart_id) VALUES(?,?,?)",[product_id,quantity,newCart.insertId]);
            newShopingCartItemId=addedItem.insertId;
            
        }
        else{
            await db.query("UPDATE  shopping_cart SET product_count=product_count+?,cart_value=cart_value+? WHERE id=? ",[quantity,productItem[0].price*quantity,haveCart[0].id]);
            const [addedItem,addedItemfields]=await db.query("INSERT INTO shopping_cart_item (product_id,quantity,shopping_cart_id) VALUES(?,?,?) ON DUPLICATE KEY UPDATE quantity=quantity+?",[product_id,quantity,haveCart[0].id,quantity]);
            newShopingCartItemId=addedItem.insertId; 
        }

        await db.query("UPDATE  product_item SET quantity=quantity-? WHERE product_id=?",[quantity,product_id]);
        console.log(haveCart[0]);
        return res.status(200).json({cart_item_id:newShopingCartItemId});
    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
}
 const deletefromCart=async(req,res)=>{
    try{
        const db=await getDb();
        const userid=req.user.id;
        const {shopping_cart_item_id}=req.body;
        const [cartItem,itfields]=await db.query("SELECT a.*,b.price FROM shopping_cart_item a LEFT JOIN product_item b ON a.product_id=b.product_id WHERE a.id=?",[shopping_cart_item_id]);
        await db.query("UPDATE product_item SET quantity=quantity+? WHERE product_id=?",[cartItem[0].quantity,cartItem[0].product_id]);
        await db.query("UPDATE shopping_cart SET product_count=product_count-?,cart_value=cart_value-? WHERE id=?",[cartItem[0].quantity,cartItem[0].price*cartItem[0].quantity,cartItem[0].shopping_cart_id]);
        await db.query("DELETE FROM shopping_cart_item WHERE id=?",[shopping_cart_item_id]);
        console.log(cartItem[0]);
        return res.status(200).json({message:"Deleted"});

    }
    catch(err){
        return res.status(500).json({error:err.message});
    }
} 
export {addtoCart,deletefromCart};