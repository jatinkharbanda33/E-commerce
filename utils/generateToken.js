import jwt from "jsonwebtoken";
const generateToken=(userId)=>{
    const payload={userId};
    const token=jwt.sign(payload,process.env.JWT_SECRET,{
        expiresIn:"15d",
    });
    return token;
}
export default generateToken;