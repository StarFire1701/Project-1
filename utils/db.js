import mongoose from "mongoose";
import dotenv from "dotenv"

dotenv.config()

const db=()=>{
    mongoose.connect(process.env.MONGO_URI)
    .then(()=>{
        console.log("Successfully connected to MongoDB");
    })
    .catch((err)=>{
        console.log("Error connecting to MongoDB",err)
    });
}

export default db;