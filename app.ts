import { PrismaClient, Room} from "@prisma/client";
import express from "express";
import bodyParser from "body-parser";
import userRouter from "./routers/userRouter";
import roomRouter from "./routers/roomRouter";
import noteRouter from "./routers/noteRouter";
import featureRouter from "./routers/featureRouter";
import cookieSession from "cookie-session";
import cors from "cors";
import { Server } from "socket.io";
import { createServer } from 'http';


const prisma = new PrismaClient();
const app = express();
const port = 3001;
const httpServer = createServer(app);

const io = new Server(httpServer , {
  cors: {
    origin: "http://localhost:3000",
    methods: ['GET' , 'POST'],
  },
});


app.set("trust proxy", 1);

app.use(
  cookieSession({
    name: "session",
    sameSite: true,
    httpOnly: true,
    secret: "adsfadsfadsfdasf",
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
  })
);

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
    methods:['GET' , 'POST']
  })
);

app.use(bodyParser.json());
app.use("/users", userRouter);
app.use("/rooms", roomRouter);
app.use("/notes", noteRouter);
app.use("/features", featureRouter);

interface User {
  id: string;
  name: string;
}

interface ChatMessage {
  id: string;
  user: User;
  text: string;
  createdAt: string;
}

const voiceCallRooms = {};

async function checkRoom(userId : string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    if(!user){
      return ;
    }

    if(!user.roomId) {
      return ;
    }

    const room = await prisma.room.findUnique({
      where: {
        id: user.roomId,
      },
      include: {
        user: true,
      },
    });

    if(!room){
      return ;
    }

    if(room.user.length === 0) {
      await prisma.room.delete({
        where:{
          id: room.id
        },
      });

      io.emit('roomList' , await prisma.room.findMany());
    }
  } catch(err) {
    console.log(err);
  }
}

io.on('connection' , (socket)=> {
  console.log(`User connected ${socket.id}`);

  socket.on('register' , async(name) => {

    if(!name){
      return;
    }
    
    const user = await prisma.user.create({
      data:{
        name,
      },
    });

    socket.data.user = user;
    socket.emit('user', socket.data.user);
    console.log('user registered' , socket.data.user);
  });

  socket.on('roomList' , async() => {
    const rooms = await prisma.room.findMany({
      include:{
        user: true,
      },
    });

    socket.emit('roomList' , rooms);
    console.log('RoomList = ' , rooms);
  });

  socket.on('userInRoom' , async(roomId) => {
    const users = await prisma.user.findMany({
      where:{
        roomId:roomId,
      },
    });

    //socket.emit('userList' , users);
    socket.to(roomId).emit('userList' , users);
    console.log('userList = ' , users);
  });

  socket.on('createRoom' , async(roomName) => {
    if (!roomName || !socket.data.user){
      return;
    }

    const room = await prisma.room.create({
      data:{
        name: roomName,
        user: {
          connect: {
            id : socket.data.user.id,
          },
        },
      },
    });

    socket.join(room.id);
    socket.emit('room' , room);
    socket.data.user.roomId = room.id;
    io.emit('roomList' , await prisma.room.findMany());
    console.log('Room registered' , room);
  });

  socket.on('joinRoom' , async(roomId) => {
    
    try{
      const room = await prisma.room.update({
      where:{
        id: roomId,
      },
      data:{
        user:{
          connect:{
            id: socket.data.user.id,
          },
        },
      },
    });

    socket.join(room.id);
    socket.data.user.roomId = room.id;
    socket.emit('room' , room);
    console.log('room that this user in is ' , socket.data.user.roomId);
    io.to(room.id).emit('room' , room);
    socket.emit('userInRoom' , room.id);
    } catch(err) {
      console.log(err);
    }
    
  });

  socket.on('sentMessage' , async(message) => {

    const room = await prisma.room.findUnique({
      where: {
        id: socket.data.user.roomId,
      },
      include: {
        user: true,
      },
    });

    if (!room) {
      return;
    }

    const newMessage = await prisma.message.create({
      data:{
        text: message,
        User: {
          connect:{
            id: socket.data.user.id,
          },
        },
      },
    });

    await prisma.room.update({
      where:{
        id: socket.data.user.roomId,
      },
      data:{
        Message: {
          connect: {
            id: newMessage.id,
          },
        },
      },
    });


    socket.to(room.id).emit('message' , {
      text: message,
      user: socket.data.user,
    });

    socket.emit('message', {
      text: message,
      user: socket.data.user,
    });

    console.log('Message = ' , message );
  });

  socket.on("createMessage", async (text: string, roomId: string, userId: string, callback: (message: { id: string, user: { id: string, name: string }, text: string, createdAt: string }) => void) => {
    const newMessage = await prisma.message.create({
      data:{
        text: text,
        User: {
          connect:{
            id: userId,
          },
        },
      },
    });
  
    

    await prisma.room.update({
      where:{
        id: roomId,
      },
      data:{
        Message: {
          connect: {
            id: newMessage.id,
          },
        },
      },
    });
  
    const message = {
      id: newMessage.id.toString(),
      user: {
        id: socket.data.user.id,
        name: socket.data.user.name,
      },
      text: newMessage.text,
      createdAt: newMessage.createdAt.toISOString(),
    };
  
    socket.to(roomId).emit("message", message);
    callback(message);
  });

  socket.on('messageInRoom' , async(roomId) => {
    const messageList = await prisma.message.findMany({
      where:{
        roomId:roomId,
      },
    });

    socket.emit('messageList' , messageList);
    console.log('messageList = ' , messageList);
  });

  socket.on('getRooms' , async(name: string) => {

    if(name === ""){
      const rooms = await prisma.room.findMany({
        include:{
          user: true,
        },
      });
      socket.emit('roomSearch' , rooms);
    };
    
    if(!name){
      console.log('Data is invalid');
      return;
    }

    const rooms = await prisma.room.findMany({
      where: {
        name: {
          contains: name
        }
      },
      include: {
        note: true,
        user: true,
        Message: true
      }
    });

    if(!rooms){
      console.log('No room that you find with ' + name);
      return;
    }

    socket.emit('roomSearch' , rooms);
    console.log('roomSearch = ' , rooms );
  });

  //use this for get all of public room (not filter room).
  socket.on('getPublicRoom' , async() => {
    const publicRooms = await prisma.room.findMany({
      where: {
        isPrivate: false,
      },
    });
    socket.emit('roomList' , publicRooms);
  });

  //get room with id (sent array in for working).
  socket.on('getRoomsWithId', async (roomIds: string[]) => {
    const rooms = await prisma.room.findMany({
      where: {
        id: {
          in: roomIds,
        },
      },
    });

    socket.emit('roomsWithId', rooms);
  });

  socket.on('leaveRoom' , async() => {
    
    const room = await prisma.room.update({
      where: {
        id: socket.data.user.roomId,
      },
      data:{
        user: {
          disconnect: {
            id : socket.data.user.id,
          },
        },
      },
    });



    socket.leave(room.id);
    socket.data.user.roomId = null;
    checkRoom(socket.data.user.id);
    io.to(room.id).emit('room' , room);

  });
  
  socket.on('disconnect' , async () => {
    if (!socket.data.user) {
      return ;
    }

    checkRoom(socket.data.user.id);

    if(socket.data.user.roomId) {

      const room = await prisma.room.update({
        where: {
          id: socket.data.user.roomId,
        },
        data: {
          user: {
            disconnect: {
              id: socket.data.user.id,
            },
          },
        },
      });

      socket.leave(room.id);
      io.to(room.id).emit('room' , room);
      socket.emit('room' , room);
    }

    await prisma.user.delete({
      where: {
        id: socket.data.user.id,
      },
    });
    console.log('User disconnected');
  });
});


app.listen(port, async () => {

  await prisma.message.deleteMany();
  await prisma.user.deleteMany();
  await prisma.room.deleteMany();

  io.listen(3002);
  console.log("Server is running on http://localhost:" + port);
});
