import jwt from 'jsonwebtoken'
export const isLoggedIn = async(req,res,next)=>{
    // Get the token
    // Validate the token if it exists
    // Extract the data from the token
    try{
        let token = req.cookies?.token
        if(!token){
            return res.status(404).json({
                message:"Authentication Failed",
                success:false
            })
        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch(err){
        console.log(err);
        return res.status(400).json({
            message:"Some error occured in auth middleware",
            success:false
        })
    }
   
}