import User from '../models/User.model.js'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'

const registerUser = async(req,res)=>{
    // get data
    // validate data
    //check if user already exists
    // if not create new user
    // generate verification token
    // save the token in database
    // send token to user via mail
    // success message
    const {name,email,password} = req.body;
    

    if(!name || !email || !password){
        return res.status(401).json({
            message:"All fields are required",
            success:false
        })
    }
    try{
         const user= await  User.findOne({email})
            if(user){
                return res.status(300).json({
                    message:"User already exists",
                    success:false
                })
            }

     const newuser = await User.create({
        name, password,email
    })
    

    if(!newuser){
        return res.status(401).json({
            message:"An error occured while registering user",
            success:false
        })
    }
    
    const token= crypto.randomBytes(32).toString("hex");
    newuser.verificationToken=token
    newuser.verificationTokenExpires = Date.now() + 1000*60*20
    await newuser.save();

    const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.MAILTRAP_NAME,
        pass: process.env.MAILTRAP_PASSWORD,
    },
    });

    const mailOptions={
        from:process.env.MAILTRAP_SENDERMAIL,
        to: newuser.email,
        subject: "Please verify your email ",
        text: `Please click on the following link:
                ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
    }

    await transporter.sendMail(mailOptions);

    

    res.status(200).json({
        message:"User registered successfully",
        success:true
    });
    } catch(err){
        console.log(err);
        res.status(404).json({
            message:"Some error occured in try block",
            success:false
        })
}
 
};

const verifyUser = async(req,res)=>{
    const {token} = req.params;
    if(!token){
        return res.status(401).json({
            message:"Verification Token not found",
            success:false
        })
    }
    const user= await User.findOne({verificationToken:token});
    if(!user){
        return res.status(401).json({
            message:"User not found",
            success:false
        })
    }
    if(!user.verificationToken|| user.verificationTokenExpires < Date.now()){
        return res.status(401).json({
            message:"Verification Token Expired or Invalid",
            success:false
        })
    }

    user.verificationToken = null
    user.verificationTokenExpires = null
    user.isVerified = true
    await user.save()

    res.status(200).json({
        message:"User verified successfully",
        success:true
    })
}

const loginUser= async(req,res)=>{
    const {email,password} = req.body;
    if(!email || !password){
        return res.status(403).json({
            message:"Email or Password is missing",
            success:false
        })
    }

    const user = await User.findOne({email})

    if(!user){
        return res.status(403).json({
            message:"Could not find user",
            success:false
        })
    }
   const isMatch = await bcrypt.compare(password,user.password);
   if(!isMatch){
    return res.status(400).json({
        message:"Incorrect ID or Password",
        success:false
    })
   }

   if(user.verificationToken!=null || user.isVerified==false){
    return res.status(403).json({
        message:"Please verify yourself first",
        success:false
    })
   }

   const token = jwt.sign({
      id:user._id,
      role:user.role
    },
    process.env.JWT_SECRET,
    {
        expiresIn: '24h'
    }
    );

    const cookieOptions = {
    httpOnly:true,
    secure:true,
    maxAge: 1000*60*60*24
    }

    res.cookie("token",token,cookieOptions);

    res.status(200).json({
        success:true,
        message: "User logged in successfully",
        token,
        user:{
            id:user._id,
            name:user.name,
            role:user.role
        }

    })
}

const getMe =  async(req,res)=>{
    const {id} = req.user;

    const user = await User.findById(id).select('-password');
    if(!user){
        return res.status(400).json({
            message:"User not Found",
            success:false
        })
    }
    return res.status(200).json({
        message:"User Found Successfully",
        user
    })
}

const logoutUser = async(req,res)=>{
    try{
        // // res.cookie('token','',{
        // //     expires: new Date(0)
        // // })

        // res.cookie('token','',{})
        // In both of the options cookie still exists in the browser.
        // So to remove it from browser we can use clearcookie
        // And since we set the http true cookies we need to clear using res.clearCookie("token",{
        // httpOnly:true,
        // secure:true
        // samesite:"strict"
        //})

        res.clearCookie("token",{
            httpOnly:true,
            secure:true,
            samesite:"strict"
        })

        return res.status(200).json({
            message:"User logged out successfully",
            success:true
        })
    } catch(err){
        console.log(err);
        return res.status(404).json({
            message:"Some error occured in try block",
            success:false
        })
    }
}

const forgotPassword = async(req,res)=>{
    // get email
    // check validation for email
    // find user based on email
    // make a reset token
    // send it to the user in mail
    // send success response
    const {email} = req.body
    if(!email){
        return res.status(404).json({
            message:"Please enter email",
            success:false
        })
    }

    const user = await User.findOne({email});
    if(!user){
        return res.status(404).json({
            message:"Please enter the correct email",
            success:false
        })
    }
    const reset_token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = reset_token
    user.resetPasswordExpires = Date.now() + 1000*60*20;
    await user.save();

    const transporter = nodemailer.createTransport({
    host: process.env.MAILTRAP_HOST,
    port: process.env.MAILTRAP_PORT,
    secure: false, // Use true for port 465, false for port 587
    auth: {
        user: process.env.MAILTRAP_NAME,
        pass: process.env.MAILTRAP_PASSWORD,
    },
    });

    const mailOptions = {
    from: process.env.MAILTRAP_SENDERMAIL,
    to: user.email,
    subject: "Forgot your Password",
    text: `Click on the following link to reset your password ${process.env.BASE_URL}/api/v1/users/resetPassword/${reset_token}`,
    }

    await transporter.sendMail(mailOptions);

    res.status(200).json({
        message:"Forgot Password token generated successfully",
        success:true
    })

}

const resetPassword = async(req,res)=>{
    const {reset_token} = req.params;
    const {password} =  req.body
    if(!reset_token){
       return  res.status(402).json({
            message: "Error finding the reset password token",
            success:false
        })
    }
    try{
        const user = await User.findOne({
            resetPasswordToken:reset_token,
            resetPasswordExpires: {$gt:Date.now()}
        });
        if(!user){
            return res.status(403).json({
                message:"Something went wrong",
                success:false
            })
        }
        user.password=password;
        user.resetPasswordExpires = null;
        user.resetPasswordToken = null;

        await user.save();
        res.status(200).json({
    message:"Password reset successful",
    success:true
})
    } catch(err){
        console.log(err);
        return res.status(401).json({
            message:"Some error occured in try block",
            success:false
        })
    }
}


export {registerUser,verifyUser,loginUser,getMe,logoutUser,forgotPassword,resetPassword};