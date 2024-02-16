import { getDb } from "../mysqlConnect/connectToDb.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/generateToken.js";
const signupUser = async (req, res) => {
  try {
    const { name, email, phone_number, password } = req.body;
    const db = await getDb();
    const [rows, fields] = await db.query("SELECT * FROM users WHERE email=?", [
      email,
    ]);
    if (rows.length != 0) {
      return res.status(400).json({ error: "Email Already Registered" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedpassword = await bcrypt.hash(password, salt);
    await db.query(
      "INSERT INTO users (name,email,phone_number,password) VALUES(?,?,?,?)",
      [name, email, phone_number, hashedpassword]
    );
    return res.status(201).json({ message: "User created" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const db = await getDb();
    const [isUser, isUserfields] = await db.query(
      "SELECT * FROM users WHERE email=?",
      [email]
    );
    if (isUser.length == 0)
      return res.status(400).json({ error: "User Not found" });
    const user = isUser[0];
    const verifypassword = await bcrypt.compare(password, user.password);
    if (!verifypassword) res.status(400).json({ error: "Wrong Password" });
    const authtoken = generateToken(user.id);
    await db.query("UPDATE USERS SET token=? WHERE id=?", [authtoken, user.id]);
    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token: authtoken,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
const logoutUser = async (req, res) => {
  try {
    const userId = req.user.id;
    const db = await getDb();
    await db.query("UPDATE USERS SET token=? WHERE id=?", [null, userId]);
    return res.status(200).json({ message: "user successfully logged out" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const addNewAddress = async (req,res) => {
  try {
    const db = await getDb();
    const userid = req.user.id;
    const {unitNo, streetNo, addressLine1, addressLine2, city, state, country} =
      req.body;
    await db.query(
      "INSERT INTO address (user_id,unit_no,street_no,address_line_1,address_line_2,city,state,country) VALUES(?,?,?,?,?,?,?,?)",
      [
        userid,
        unitNo,
        streetNo,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
      ]
    );
    return res.status(201).json({ message: "Address Successfully added" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const defaultAddress = async (req,res) => {
  try {
    const userid = req.user.id;
    const {address_id} = req.body;
    const db = await getDb();
    const [isAlready, field] = await db.query(
      "SELECT * FROM default_address WHERE user_id=?",
      [userid]
    );
    if (isAlready.length != 0) {
      await db.query(
        "UPDATE default_address SET address_id=? WHERE user_id=?",
        [address_id, userid]
      );
    } else {
      await db.query(
        "INSERT INTO default_address (user_id,address_id) VALUES(?,?)",
        [userid, address_id]
      );
    }
    return res.status(200).json({ message: "Default address changed" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const deleteAddress = async (req,res) => {
  try {
    const userid = req.user.id;
    const {address_id} = req.body;
    const db = await getDb();
    const [isAlready, field] = await db.query(
      "SELECT * FROM default_address WHERE user_id=? AND address_id=?",
      [userid, address_id]
    );
    if (isAlready.length != 0) {
      await db.query(
        "DELETE FROM default_address WHERE user_id=? AND address_id=?",
        [address_id, userid]
      );
    }
    await db.query("DELETE FROM address WHERE address_id=?", [address_id]);
    return res.status(200).json({ message: "Address Deleted" });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const getdefaultAddress = async (req,res) => {
  try {
    const userid = req.user.id;
    const db = await getDb();
    const [isAlready, field] = await db.query(
      "SELECT * FROM default_address WHERE user_id=?",
      [userid]
    );
    if(isAlready.length==0){
      return res.status(400).json({message:"You dont have a default address"});
    }
    const [address,itsfields]=await db.query('SELECT * FROM address where address_id=?',[isAlready[0].address_id]);
    return res.status(200).json(address[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
const getAddress = async (req,res) => {
  try {
    const {address_id}=req.body;
    const db = await getDb();
    const [address,itsfields]=await db.query('SELECT * FROM address where address_id=?',[address_id]);
    return res.status(200).json(address[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
export {
  signupUser,
  loginUser,
  logoutUser,
  addNewAddress,
  defaultAddress,
  deleteAddress,
  getdefaultAddress,
  getAddress
};
