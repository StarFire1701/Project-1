import express from 'express';
import {createPost,getAllPost,getPost} from '../controllers/post.controller.js'
import {isLoggedIn} from '../middleware/auth.middleware.js'

const router = express.Router();

router.post('/create-post',isLoggedIn,createPost);
router.get('/get-all-post',getAllPost);
router.get('/get/:id',getPost)

export default router;