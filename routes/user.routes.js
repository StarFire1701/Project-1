import express from 'express'
import {registerUser, verifyUser,loginUser,getMe,logoutUser, forgotPassword,resetPassword,generateNewToken} from '../controllers/user.controller.js'
import { isLoggedIn } from '../middleware/auth.middleware.js';

const router=express.Router()

router.post("/register",registerUser);
router.get("/verify/:token",verifyUser);
router.post("/login",loginUser);
router.post("/me", isLoggedIn, getMe);
router.post("/logout",isLoggedIn,logoutUser);
router.get("/forgotPassword",forgotPassword);
router.patch("/resetPassword/:reset_token",resetPassword);
router.post("/refresh-token",generateNewToken);

export default router;