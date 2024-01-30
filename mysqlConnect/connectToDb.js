import dotenv from "dotenv";
import mysql from 'mysql2/promise'
dotenv.config();
let _db;
const connectToDb = async () => {
  let connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  console.log("Connected to MySQL Server");
  _db=connection;
};
const getDb=async()=>{
  return _db;
}
export  {connectToDb,getDb};