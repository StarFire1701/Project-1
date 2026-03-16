import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import db from './utils/db.js'
import userRoutes from './routes/user.routes.js'
import CookieParser from 'cookie-parser';
import cookieParser from 'cookie-parser';


const app=express();
dotenv.config();

const PORT = process.env.PORT || 4000;


app.use(cors({
    origin:process.env.BASE_URL,
    methods:['GET','POST','PUT','DELETE','PATCH'],
    allowedHeaders:['Content-Type','Authorization']
}))
app.use(cookieParser())

app.use(express.json());
app.use(express.urlencoded({
    extended:true
}));
db();

// app.get('/hello',(req,res)=>{
//     res.send("Hello");
// })

app.use('/api/v1/users',userRoutes);


app.listen(PORT,()=>{
    console.log(`Server Running on Port ${PORT}`);
})