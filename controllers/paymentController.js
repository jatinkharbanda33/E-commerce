import { getDb } from "../mysqlConnect/connectToDb.js";
const handlepayment = async (req, res) => {
  try {
    const cartid = req.params.id;
    const db = await getDb();
    const userid = req.user.id;
    const method = String(req.query.method);
    if (!cartid || !method)
      return res.status(400).json({ error: "Invalid request" });
    const [paymentmethod, paymentmethodfields] = await db.query(
      "SELECT id from payment_type WHERE type=?",
      [method]
    );
    const [paymentvalue,paymentvaluefields]=await db.query("SELECT cart_value from shopping_cart WHERE id=?",[cartid]);
    let status=1;
    if (paymentmethod.length === 0)
      return res.status(400).json({ error: "Invalid payment method" });
   
    const [newpayment, newpaymentfields] = await db.query(
      "INSERT INTO user_payment_detail(user_id,payment_type_id,provider,Status,Time,shopping_cart_id,amount) VALUES(?,?,?,?,?,?,?)",
      [userid, paymentmethod[0].id, "Razorpay", status, new Date(), cartid,paymentvalue[0].cart_value]
    );
    if(status){
        await db.query("UPDATE shopping_cart SET status=? WHERE id=?",[status,cartid]);
    }
    return res.status(200).json({paymentstatus:status});
  } catch (err) {
    return res.status(500).json({error:err.message});
  }
};
export {handlepayment};
