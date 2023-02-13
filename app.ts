import { PrismaClient, Room, User } from "@prisma/client";
import express from "express";
import bodyParser, { Options } from "body-parser";

import userRouter from "./routers/userRouter";
import roomRouter from "./routers/roomRouter";
import noteRouter from "./routers/noteRouter";
import featureRouter from "./routers/featureRouter";
import cookieSession from "cookie-session";
import cors from "cors";
import { Server } from "socket.io";
import { Socket } from "dgram";

const prisma = new PrismaClient();
const io = new Server();
const app = express();
const port = 3001;

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
    methods:['GET' , 'POST' , 'DELETE' , 'PUT']
  })
);

app.use(bodyParser.json());

app.use("/users", userRouter);
app.use("/rooms", roomRouter);
app.use("/notes", noteRouter);
app.use("/features", featureRouter);



let chatRoom: Room | null = null;
let allUsers: User[];

io.on('connection' , (socket)=> {
  console.log(`User connected ${socket.id}`);

  socket.on('join-room' , async(data) => {
    const {userId , roomId} = data;

    // find room with room_id that response from front
    let foundRoom = await prisma.room.findUnique({
      where:{
        id:roomId
      }
    });

    let foundUser = await prisma.user.findUnique({
      where: {
        id:userId
      }
    });

    if (!foundUser){
      return;
    }

    // Check that room is exist 
    // if don't exist we create new room and name it with room id
    if (!foundRoom){
      foundRoom = await prisma.room.create({
        data:{
          name:roomId,
          total:1
        }
      });
      socket.join(foundRoom.id);
      io.to(foundRoom.name).emit("room_update", foundRoom.id);
      socket.emit("server_response", "Room has been updated.");
    }

    // Update room data
    await prisma.room.update({
      where:{
        id:roomId
      },
      data:{
        userList:{
          connect:{
            id:userId
          }
        },
        total:{
          increment:1
        }
      }
    });

    // if room exist will proc here.
    socket.join(foundRoom.id);
    io.to(foundRoom.name).emit("room_update", foundRoom.id);
    socket.emit("server_response", "Room has been updated.");

    // Sent message to room.
    let __createdtime__ = Date.now();
    socket.to(foundRoom.id).emit('receive_message' , {
      message: `${userId.name} has joined the chat room`,
      username: userId.name,
      __createdtime__,
    });

    // Sent message to Welcome people that join in
    socket.emit('receive_message', {
      message: `Welcome ${userId.name}`,
      username: userId.name,
      __createdtime__,
    });

    //Save the new user to room
    chatRoom = await prisma.room.findUnique({
      where:{
        id:roomId
      }
    });

    allUsers.push({ id: socket.id , name:foundUser.name  , roomId:foundRoom.id });
    // @ts-ignore: Object is possibly 'null'.
    let chatRoomUsers = allUsers.filter((user) => user.roomId === foundRoom.id);
    socket.to(foundRoom.id).emit('chatroom_users', chatRoomUsers);
    socket.emit('chatroom_users', chatRoomUsers);

    

  });



  

});

app.listen(port, async () => {
  await prisma.user.deleteMany({ where: {} });
  await prisma.room.deleteMany({ where: {} });
  await roomSeeder();
  await userSeeder();
  io.listen(3002);
  console.log("Server is running on http://localhost:" + port);
});

async function userSeeder() {
  await prisma.user.deleteMany({ where: {} });

  await prisma.user.create({
    data: {
      name: "Alice",
      room:{
        connectOrCreate:{
          create:{
            name:'Lobby1'
          },
          where:{
            id:""
          }
        }
      }
    },
  });

  await prisma.user.create({
    data: {
      name: "Alex",
      room:{
        connectOrCreate:{
          create:{
            name:'Lobby2'
          },
          where:{
            id:""
          }
        }
      }
    },
  });

  console.log("Seeder completed");
}

async function roomSeeder() {

  await prisma.room.create({
    data: {
      name: "Pondzza007",
    },
  });

  console.log("Room seeder is completed.");
}

// const rooms: Record<string, any> = {};

// io.on("connection", (socket) => {
//   console.log(socket.id)
//   socket.on("set name", (name) => {
//     socket.data.name = name;
//     socket.emit("server_response", "You name has been set.");
//   });

//   socket.on("create room", (room_name) => {
//     if (!socket.data.name) return;
//     if (rooms[room_name]) return;

//     rooms[room_name] = {
//       name: room_name,
//       messages: [],
//       users: [socket.data.name],
//       background: 'default',
//     };

//     socket.data.room_name = room_name;
//     socket.join(room_name);
//     io.to(socket.data.room_name).emit("room_update", rooms[socket.data.room_name]);
//     socket.emit("server_response", "You joined " + room_name);
//     socket.emit("server_response", "Room has been created.");
//   });

//   socket.on("join room", (room_name) => {
//     if (!socket.data.name) return;
//     if (!rooms[room_name]) return;

//     socket.data.room_name = room_name;
//     socket.join(room_name);

//     rooms[room_name].users.push(socket.data.name);

//     io.to(socket.data.room_name).emit("room_update", rooms[socket.data.room_name]);
//     socket.emit("server_response", "You joined " + room_name);
//   });

//   socket.on("message", (message) => {
//     if (!socket.data.room_name) return;

//     rooms[socket.data.room_name].messages.push(socket.data.name,' : ',message);

//     io.to(socket.data.room_name).emit("room_update", rooms[socket.data.room_name]);
//   });
// });
