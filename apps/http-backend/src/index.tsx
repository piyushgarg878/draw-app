import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import {middleware} from "./middleware";
import { CreateUserSchema ,SiginSchema,CreateRoomSchema }  from "@repo/common/types";


const app=express();



app.post('/signup',(req,res)=>{
    const data= CreateUserSchema.safeParse(req.body);
    if(!data.success){
        res.status(400).json({
            message:"invalid data"
        })
        return;
    }
    
    
})
app.post('/signin',(req,res)=>{
    const {userid,email,password}=req.body;
    const token=jwt.sign({userid},JWT_SECRET);
    console.log('sigin in end point called');
    res.send("you are signed in");
})
app.post('room',middleware,(req,res)=>{

    console.log('room end point called');
    res.send("room created");
})


app.listen(3001,()=>{
    console.log("listening on port 3000");
})



