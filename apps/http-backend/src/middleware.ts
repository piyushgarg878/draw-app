import { NextFunction, Request,Response } from "express";
import { JWT_SECRET } from "@repo/backend-common/config";
import  jwt  from "jsonwebtoken";
export interface RequestWithUserId extends Request{
    userId?:string;
}
export function middleware(req:RequestWithUserId, res:Response,next:NextFunction) {
    const token=req.headers['authorization'] ?? " ";
    if(!token){
        res.status(401).send("please sigin in first");
    }
    const decoded=jwt.verify(token,JWT_SECRET) as {userid:string};
    if(decoded){
        req.userId=decoded.userid;
        next();
    }
    else{
        res.status(401).send("please sigin in first");
    }
}