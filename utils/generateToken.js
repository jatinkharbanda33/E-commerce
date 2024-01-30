import jwt from "jsonwebtoken";
const generateToken=(userId,password)=>{
    const payload={userId,password};
    const token=jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:"15d",
    });
    return token;
}
export default generateToken;