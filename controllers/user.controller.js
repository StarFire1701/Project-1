import User from '../models/User.model.js'
import crypto from 'crypto'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import {
  ApiError,
  BadRequestError,
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  InternalServerError,
} from '../utils/ApiError.js'

const registerUser = async (req, res) => {
  // get data
  // validate data
  // check if user already exists
  // if not create new user
  // generate verification token
  // save the token in database
  // send token to user via mail
  // success message
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    throw new BadRequestError('All fields are required');
  }

  try {
    const user = await User.findOne({ email });
    if (user) {
      throw new ConflictError('User already exists');
    }

    const newuser = await User.create({
      name,
      password,
      email,
    });

    if (!newuser) {
      throw new InternalServerError('An error occured while registering user');
    }

    const token = crypto.randomBytes(32).toString('hex');
    newuser.verificationToken = token;
    newuser.verificationTokenExpires = Date.now() + 1000 * 60 * 20;
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

    const mailOptions = {
      from: process.env.MAILTRAP_SENDERMAIL,
      to: newuser.email,
      subject: 'Please verify your email ',
      text: `Please click on the following link:
                ${process.env.BASE_URL}/api/v1/users/verify/${token}`,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User registered successfully',
    });
  } catch (err) {
    console.error(err);
    if (err instanceof ApiError) throw err;
    throw new InternalServerError();
  }
};

const verifyUser = async (req, res) => {
  const { token } = req.params;
  if (!token) {
    throw new BadRequestError('Verification Token not found');
  }

  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    throw new NotFoundError('User not found');
  }

  if (!user.verificationToken || user.verificationTokenExpires < Date.now()) {
    throw new BadRequestError('Verification Token Expired or Invalid');
  }

  user.verificationToken = null;
  user.verificationTokenExpires = null;
  user.isVerified = true;
  await user.save();

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'User verified successfully',
  });
}

const loginUser = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Email or Password is missing');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError('Could not find user');
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new UnauthorizedError('Incorrect ID or Password');
  }

  if (user.verificationToken != null || user.isVerified === false) {
    throw new UnauthorizedError('Please verify yourself first');
  }

  const token = jwt.sign(
    {
      id: user._id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: '24h',
    }
  );

  const cookieOptions = {
    httpOnly: true,
    secure: true,
    maxAge: 1000 * 60 * 60 * 24,
  };

  res.cookie('token', token, cookieOptions);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'User logged in successfully',
    token,
    user: {
      id: user._id,
      name: user.name,
      role: user.role,
    },
  });
}

const getMe = async (req, res) => {
  const { id } = req.user;

  const user = await User.findById(id).select('-password');
  if (!user) {
    throw new NotFoundError('User not Found');
  }

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'User Found Successfully',
    data: { user },
  });
}

const logoutUser = async (req, res) => {
  try {
    res.clearCookie('token', {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'User logged out successfully',
    });
  } catch (err) {
    console.error(err);
    throw new InternalServerError('Some error occured in try block');
  }
}

const forgotPassword = async (req, res) => {
  // get email
  // check validation for email
  // find user based on email
  // make a reset token
  // send it to the user in mail
  // send success response
  const { email } = req.body;
  if (!email) {
    throw new BadRequestError('Please enter email');
  }

  const user = await User.findOne({ email });
  if (!user) {
    throw new NotFoundError('Please enter the correct email');
  }

  const reset_token = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = reset_token;
  user.resetPasswordExpires = Date.now() + 1000 * 60 * 20;
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
    subject: 'Forgot your Password',
    text: `Click on the following link to reset your password ${process.env.BASE_URL}/api/v1/users/resetPassword/${reset_token}`,
  };

  await transporter.sendMail(mailOptions);

  return res.status(200).json({
    success: true,
    statusCode: 200,
    message: 'Forgot Password token generated successfully',
  });
}

const resetPassword = async (req, res) => {
  const { reset_token } = req.params;
  const { password } = req.body;

  if (!reset_token) {
    throw new BadRequestError('Error finding the reset password token');
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: reset_token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError('Something went wrong');
    }

    user.password = password;
    user.resetPasswordExpires = null;
    user.resetPasswordToken = null;

    await user.save();

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Password reset successful',
    });
  } catch (err) {
    console.error(err);
    if (err instanceof ApiError) throw err;
    throw new InternalServerError('Some error occured in try block');
  }
}


export {registerUser,verifyUser,loginUser,getMe,logoutUser,forgotPassword,resetPassword};