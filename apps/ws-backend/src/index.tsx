import {WebSocketServer, WebSocket} from "ws"
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";
 
const wss = new WebSocketServer({ port: 8080 });
interface User{
  ws: WebSocket;
  userId: string;
  rooms: string[];
}
const users:User[]=[];

function checkuser(token:string):string|null{
    const decoded=jwt.verify(token,JWT_SECRET);
    if(typeof decoded=="string"){
      return null;
    }
    if(!decoded || !decoded.userId){
      return null;
    }
    return decoded.userId;
}
wss.on('connection', function connection(ws,request) {
  const url = request.url;
  if(!url){
    return;
  }
  const queryparams=new URLSearchParams(url.split('?')[1]);
  const token=queryparams.get('token') || "";
  const userId=checkuser(token);
  if(userId==null){
    ws.close();
    return;
  }
  users.push({ 
    userId:userId,
    rooms:[],
    ws:ws
  })
  ws.on('message', async function message(data) {
    const parsedData=JSON.parse(data.toString());
    if(parsedData.type=="join-room"){
        const user=users.find(x=>x.ws===ws);
        user?.rooms.push(parsedData.roomId); 
      }
    if(parsedData.type=="leave-room"){
      const user=users.find(x=>x.ws===ws);
      if(!user){
        return;
      }
      user.rooms=user?.rooms.filter(x=>x===parsedData.room);
    }
    if(parsedData.type=="chat"){
      const roomId=parsedData.roomId;
      const message=parsedData.message;
      await prismaClient.chat.create({
        data:{
          roomId,
          message:message,
          userId
        }
      })
      users.forEach(user=>{
        if(user.rooms.includes(roomId)){
          user.ws.send(JSON.stringify({
            type:"chat",
            message:message,
            roomId
          }))
        }
      })
    }
    });

  ws.send('something');
});
