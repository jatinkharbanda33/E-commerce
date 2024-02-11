import { getDb } from "../mysqlConnect/connectToDb.js";
import jwt from "jsonwebtoken";
const protectRoute = async (req, res, next) => {
    try {
       const headers = req.headers.authorization;
       if (!headers || !headers.startsWith("Bearer ")) {
         return res.status(401).json({ message: "Unauthorized" });
       }
       const token = headers.split("Bearer ")[1];
       if (!token) {
         return res.status(401).json({ message: "Unauthorized" });
       }
       const decode = jwt.verify(token, process.env.JWT_SECRET);
       if (!decode || !decode.userId) {
         return res.status(401).json({ message: "Invalid token" });
       }
       const userId = String(decode.userId);
       const db=await getDb();
       const [rows,userfields] = await db.query('SELECT id,email,name FROM Users WHERE id = ?',[userId]);
       if (rows.length === 0) {
         return res.status(400).json({ message: "User does not exist" });
       }
   
       req.user=rows[0]; 
       next();
    } catch (err) {
       console.error(err);
       res.status(500).json({ error: "Internal Server Error" });
    }
   };
   export default protectRoute;