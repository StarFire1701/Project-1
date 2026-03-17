import express from 'express'
import Post from '../models/Post.model.js'
import { ApiError, BadRequestError, InternalServerError, NotFoundError, UnauthorizedError } from '../utils/ApiError';

const createPost= async(req,res)=>{
    // Get the content from body
    // Validate the content
    // get the id from the request
    // Create the new instance of the model
    // Send successful response to user
    try{
        let id = req.user.id;
        if(!id){
            throw new UnauthorizedError("Invalid User")
        }
        let {title,content,category,image}= req.body;
        if(!title || !content || !category || !image){
            throw new BadRequestError("All fields are required");
        }

        const new_post = await  new Post.create({
            title,
            content,
            category,
            image,
            author: id
        })
        // if(!new_post){
        //     throw new InternalServerError("Something went wrong")
        // }
        // No need to write this as if model was not created it will throw error itself
        

        return res.status(201).json({
              success: true,
              statusCode: 201,
              message: 'Post created successfully',
              post: new_post
        });

    } catch(err){
        if (err instanceof ApiError) throw err;
        throw new InternalServerError("Failed to create post");
    }
    

};

const getAllPost = async(req,res)=>{
    // Find all the posts using a function in MongoDB
    // Filter out post id title and tags from that
    // return it to user

    try{
        const{page = 1,limit = 10, search ="",category} =req.query;
        page = Number(page);
        limit = Number(limit);
        const skip = (page-1)*limit;

        let query = {};
        if(search){
            query.title= {$regex:search, $options:'i'};
        }
        if(category){
            query.category = category
        }
        
        const all_posts = Post.find({isDeleted:false})
                    .populate("author","name")
                    .select("title category likes image views author createdAt")
                    .sort({createdAt:-1})
                    .skip(skip)
                    .limit(limit);
        const totalPosts = await Post.countDocuments(query);

        return res.status(200).json({
            success:true,
            statuscode:200,
            totalPages: Math.ceil(totalPosts/limit),
            totalPosts,
            all_posts
        });
    } catch(err){
        throw new InternalServerError("Failed to fetch posts");
    }
    
};

const getPost = async(req,res) =>{
    // Fetch the post id from the oarams
    // Check if it is valid or not
    // Find the post based on the id
    // Return the post
    try{
        const {id} = req.params;
        if(!id){
            throw new BadRequestError("All credentials are required");
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            throw new BadRequestError("Invalid Post ID");
        }
        const post = await Post.findById({_id:id,isDeleted:false})
                    .populate("author","name")
                    .select("-isDeleted");
        if(!post){
            throw new NotFoundError("Post not Found Error")
        }
        return res.status(200).json({
            success:true,
            status:200,
            post
        });
    } catch(err){
        if(err instanceof ApiError) throw err;
        throw new InternalServerError("Failed to fetch the post");
    }
};

export {createPost,getAllPost,getPost};
