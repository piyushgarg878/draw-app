import express from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import {middleware} from "./middleware";
import { CreateUserSchema ,SiginSchema,CreateRoomSchema }  from "@repo/common/types";
import { prismaClient } from "@repo/db/client";


const app=express();
app.use(express.json());


app.post('/signup',async(req,res)=>{
    const parsedData= CreateUserSchema.safeParse(req.body);
    console.log(parsedData)

    if(!parsedData.success){
        res.status(400).json({
            message:"invalid data"
        })
        return;
    }
    try{
        const user=await prismaClient.user.create({
            // @ts-ignore 
            data:{
                // @ts-ignore
                name:parsedData.data?.username,
                // @ts-ignore
                email:parsedData.data?.email,
                password:parsedData.data?.password 
            } 
        })
        res.json({
            userid: user.id
        }) 
    }catch(e){
        console.log(e);
        res.status(500).json({
            message:"something went wrong"
        })
    }
    
    
    
})
app.post('/signin',async(req,res)=>{
    const parsedData= SiginSchema.safeParse(req.body);
    console.log(parsedData)

    if(!parsedData.success){
        res.status(400).json({
            message:"invalid data"
        })
        return;
    }
    const user=await  prismaClient.user.findFirst({
        where:{
            name:parsedData.data?.username,
            password:parsedData.data?.password
        }
    })
    if(!user){
        res.status(401).json({
            message:"invalid credentials"
        })
        return;
    }
    const token=jwt.sign({
        username:parsedData.data?.username
    },JWT_SECRET);
    res.json({
        token
    })    

})
app.post('/room',middleware,(req,res)=>{
    // @ts-ignore
    const parsedData=CreateRoomSchema.safeParse(req.body);
    if(!parsedData.success){
        res.status(400).json({
            message:"invalid data"
        })
        return;
    }
    // @ts-ignore
    const userid=req.user?.id;

    const room=prismaClient.room.create({
        data:{  
            slug:parsedData.data?.name,
            adminId : userid 
        }})
    res.json({
        // @ts-ignore
        roomid:room?.id 
    })
})


app.listen(3001,()=>{
    console.log("listening on port 3000");
})



