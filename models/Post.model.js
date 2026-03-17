import mongoose from 'mongoose'

const postSchema = new mongoose.Schema({
   title:{
    type:String,
    required:true,
    trim:true,
    index:true
   },
   content:{
    type:String,
    required:true,
   },
   likes:[
    {
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        default:[]
    }
   ],
   isDeleted:{
    type:Boolean,
    default:false
   },
   category:{
    type:String,
    required:true,
    trim:true
   },
   image:{
    type:String
   },
   views:{
    type:Number,
    default:0
   },
   author:{
    type:mongoose.Schema.Types.ObjectId,
    ref:"User",
    required:true
   }
},{
    timestamps:true
});

const Post = mongoose.model("Post",postSchema);

export default Post;