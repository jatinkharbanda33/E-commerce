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
    console.log(productItem[0]);
    if (productItem[0].quantity < quantity)
      return res.status(400).json({ error: "Invalid Item Quantity" });
    const [haveCart, cartfields] = await db.query(
      "SELECT * FROM shopping_cart WHERE user_id=? AND status=0",
      [user_id]
    );
    let newShopingCartItemId;
    if (haveCart.length == 0) {
      const [newCart, newcartfields] = await db.query(
        "INSERT INTO shopping_cart(user_id,product_count,cart_value) VALUES(?,?,?)",
        [user_id, quantity, quantity * productItem[0].price]
      );
      const [addedItem, addedItemfields] = await db.query(
        "INSERT INTO shopping_cart_item (product_id,quantity,shopping_cart_id) VALUES(?,?,?)",
        [product_id, quantity, newCart.insertId]
      );
      newShopingCartItemId = addedItem.insertId;
    } else {
      await db.query(
        "UPDATE  shopping_cart SET product_count=product_count+?,cart_value=cart_value+? WHERE id=? ",
        [quantity, productItem[0].price * quantity, haveCart[0].id]
      );
      const [addedItem, addedItemfields] = await db.query(
        "INSERT INTO shopping_cart_item (product_id,quantity,shopping_cart_id) VALUES(?,?,?) ON DUPLICATE KEY UPDATE quantity=quantity+?",
        [product_id, quantity, haveCart[0].id, quantity]
      );
      newShopingCartItemId = addedItem.insertId;
    }

    await db.query(
      "UPDATE  product_item SET quantity=quantity-? WHERE product_id=?",
      [quantity, product_id]
    );
    console.log(haveCart[0]);
    return res.status(200).json({ cart_item_id: newShopingCartItemId });
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
    console.log("hello 1");
    const [currItem, currItemfields] = await db.query(
      "SELECT a.*,b.price ,b.quantity as total_quantity FROM shopping_cart_item a LEFT JOIN product_item b ON a.product_id=b.product_id WHERE a.id=?",
      [shopping_cart_item_id]
    );
    if (currItem.length == 0) {
      return res.status(400).json({ error: "Invalid Item Id" });
    }
    console.log("hello 2");
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
export { addtoCart, deletefromCart, updatecartitemquantity };
