import { response } from "express";
import { getDb } from "../mysqlConnect/connectToDb.js";
const addtoCart = async (req, res) => {
  try {
    const db = await getDb();
    const user_id = req.user.id;
    const { product_id, quantity } = req.body;
    const [productItem, fields] = await db.query(
      "SELECT * FROM product_item WHERE product_id=?",
      [product_id]
    );
    if (productItem[0].quantity < quantity)
      return res.status(400).json({ error: "Invalid Item Quantity" });
    const [haveCart, cartfields] = await db.query(
      "SELECT * FROM shopping_cart WHERE user_id=? AND status=0 AND merchant_id=?",
      [user_id,productItem[0].merchant_id]
    );
    let newShopingCartItemId;
    let cartid;
    if (haveCart.length == 0) {
      const [newCart, newcartfields] = await db.query(
        "INSERT INTO shopping_cart(user_id,product_count,cart_value,merchant_id) VALUES(?,?,?,?)",
        [user_id, quantity, quantity * productItem[0].price,productItem[0].merchant_id]
      );
      const [addedItem, addedItemfields] = await db.query(
        "INSERT INTO shopping_cart_item (product_id,quantity,shopping_cart_id) VALUES(?,?,?)",
        [product_id, quantity, newCart.insertId]
      );
      newShopingCartItemId = addedItem.insertId;
      cartid=newCart.insertId;
    } else {
      await db.query(
        "UPDATE  shopping_cart SET product_count=product_count+?,cart_value=cart_value+? WHERE id=? ",
        [quantity, productItem[0].price * quantity, haveCart[0].id]
      );
      const [addedItem, addedItemfields] = await db.query(
        "INSERT INTO shopping_cart_item (product_id,quantity,shopping_cart_id) VALUES(?,?,?) ON DUPLICATE KEY UPDATE quantity=quantity+?",
        [product_id, quantity, haveCart[0].id,quantity]
      );

      newShopingCartItemId = addedItem.insertId;
      cartid=haveCart[0].id;
    }

    await db.query(
      "UPDATE  product_item SET quantity=quantity-? WHERE product_id=?",
      [quantity, product_id]
    );
    return res.status(200).json({ cart_item_id: newShopingCartItemId , cart_id:cartid});
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const deletefromCart = async (req, res) => {
  try {
    const db = await getDb();
    const userid = req.user.id;
    const { shopping_cart_item_id } = req.body;
    const [cartItem, itfields] = await db.query(
      "SELECT a.*,b.price FROM shopping_cart_item a LEFT JOIN product_item b ON a.product_id=b.product_id WHERE a.id=?",
      [shopping_cart_item_id]
    );
    await db.query(
      "UPDATE product_item SET quantity=quantity+? WHERE product_id=?",
      [cartItem[0].quantity, cartItem[0].product_id]
    );
    await db.query(
      "UPDATE shopping_cart SET product_count=product_count-?,cart_value=cart_value-? WHERE id=?",
      [
        cartItem[0].quantity,
        cartItem[0].price * cartItem[0].quantity,
        cartItem[0].shopping_cart_id,
      ]
    );
    await db.query("DELETE FROM shopping_cart_item WHERE id=?", [
      shopping_cart_item_id,
    ]);
    console.log(cartItem[0]);
    return res.status(200).json({ message: "Deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const updatecartitemquantity = async (req, res) => {
  try {
    const db = await getDb();
    const shopping_cart_item_id = req.params.id;
    const { new_quantity } = req.body;
    if (!shopping_cart_item_id && !new_quantity) {
      return res.status(400).json({ error: "Invalid request" });
    }
    if (new_quantity <= 0) {
      return res.status(400).json({ error: "Invalid quantity" });
    }
    const [currItem, currItemfields] = await db.query(
      "SELECT a.*,b.price ,b.quantity as total_quantity FROM shopping_cart_item a LEFT JOIN product_item b ON a.product_id=b.product_id WHERE a.id=?",
      [shopping_cart_item_id]
    );
    if (currItem.length == 0) {
      return res.status(400).json({ error: "Invalid Item Id" });
    }
    if (currItem[0].total_quantity + currItem[0].quantity - new_quantity < 0) {
      return res.status(400).json({ error: "ORDER LIMIT EXCEEDS" });
    }
    await db.query("UPDATE product_item SET quantity=? WHERE id=?", [
      currItem[0].total_quantity + currItem[0].quantity - new_quantity,
      currItem[0].product_id,
    ]);
    await db.query(
      "UPDATE shopping_cart SET product_count=product_count+?, cart_value=cart_value+? WHERE ID=?",
      [
        new_quantity - currItem[0].quantity,
        new_quantity * currItem[0].price -
          currItem[0].quantity * currItem[0].price,
        currItem[0].shopping_cart_id,
      ]
    );
    await db.query("UPDATE shopping_cart_item SET quantity=? WHERE id=?", [
      new_quantity,
      shopping_cart_item_id,
    ]);
    return res.status(200).json({ message: "Quantity updated" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const removecart=async(req,res)=>{
    try{
        const cart_id=req.params.id;
        if(!cart_id) return res.status(400).json({error:"Invalid Request"});
        const db=await getDb();
        await db.query("UPDATE product_item a JOIN shopping_cart_item b ON a.product_id = b.product_id SET a.quantity = a.quantity + b.quantity WHERE b.shopping_cart_id = ?",[cart_id]);
        await db.query("DELETE FROM shopping_cart_item WHERE shopping_cart_id=?",[cart_id]);
        await db.query("DELETE FROM shopping_cart WHERE id=?",[cart_id]);
        return res.status(200).json({message:"Cart is empty now"});
    }
    catch(err){
        return res.status(500).json({ error: err.message });
    }
}
const getusercart=async(req,res)=>{
  try{
    const userid=req.user.id;
    const [usercarts,usercartsfield]=await db.query("SELECT * FROM shopping_cart WHERE user_id=? AND status=0",[userid]);
    return res.status(200).json(usercarts);

  }
  catch(err){
    return res.status(500).json({ error: err.message });

  }
}
export { addtoCart, deletefromCart, updatecartitemquantity,removecart,getusercart};


// cart delete // cart_items mn hai unko product quanitity mn add krna hai