import { getDb } from "../mysqlConnect/connectToDb.js";
const handlepayment = async (req, res) => {
  try {
    const db = await getDb();
    const userid = req.user.id;
    const method = String(req.query.method);
    const [carts, cartsfields] = await db.query(
      "SELECT * from shopping_cart where user_id=? AND status=0",
      [userid]
    );
    if (carts.length == 0) res.status(400).json({ error: "Invalid Request" });
    const [paymentmethod, paymentmethodfields] = await db.query(
      "SELECT id from payment_type WHERE type=?",
      [method]
    );
    let status = 1;
    let currdatetime = new Date();
    if (paymentmethod.length === 0)
      return res.status(400).json({ error: "Invalid payment method" });

    for (let i = 0; i < carts.length; i++) {
      const [newpayment, newpaymentfields] = await db.query(
        "INSERT INTO user_payment_detail(user_id,payment_type_id,provider,Status,Time,shopping_cart_id,amount) VALUES(?,?,?,?,?,?,?)",
        [
          userid,
          paymentmethod[0].id,
          "Razorpay",
          status,
          currdatetime,
          carts[i].id,
          carts[i].cart_value,
        ]
      );
      await db.query(
        "UPDATE shopping_cart SET status=?,order_date=?,user_payment_detail_id=?,order_status_id=1 WHERE id=?",
        [status, currdatetime, newpayment.insertId, carts[i].id]
      );
    }

    return res.status(200).json({ paymentstatus: status });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
export { handlepayment };
