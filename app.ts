import { PrismaClient } from "@prisma/client";
import express from "express";
import bodyParser, { Options } from "body-parser";

import userRouter from "./routers/userRouter";
import roomRouter from "./routers/roomRouter";
import noteRouter from "./routers/noteRouter";
import featureRouter from "./routers/featureRouter";
import cookieSession from "cookie-session";
import cors from "cors";
import { Server } from "socket.io";

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
  })
);

app.use(bodyParser.json());

app.use("/users", userRouter);
app.use("/rooms", roomRouter);
app.use("/notes", noteRouter);
app.use("/features", featureRouter);

const rooms: Record<string, any> = {};

io.on("connection", (socket) => {
  socket.on("set name", (name) => {
    socket.data.name = name;
    socket.emit("server_response", "You name has been set.");
  });

  socket.on("create room", (room_name) => {
    if (!socket.data.name) return;
    if (rooms[room_name]) return;

    rooms[room_name] = {
      name: room_name,
      messages: [],
      users: [socket.data.name],
      background: 'default',
    };

    socket.data.room_name = room_name;
    socket.join(room_name);
    io.to(socket.data.room_name).emit("room_update", rooms[socket.data.room_name]);
    socket.emit("server_response", "You joined " + room_name);
    socket.emit("server_response", "Room has been created.");
  });

  socket.on("join room", (room_name) => {
    if (!socket.data.name) return;
    if (!rooms[room_name]) return;

    socket.data.room_name = room_name;
    socket.join(room_name);

    rooms[room_name].users.push(socket.data.name);

    io.to(socket.data.room_name).emit("room_update", rooms[socket.data.room_name]);
    socket.emit("server_response", "You joined " + room_name);
  });

  socket.on("message", (message) => {
    if (!socket.data.room_name) return;

    rooms[socket.data.room_name].messages.push(socket.data.name,' : ',message);

    io.to(socket.data.room_name).emit("room_update", rooms[socket.data.room_name]);
  });
});

app.listen(port, async () => {
  await userSeeder();
  //await roomSeeder()
  io.listen(3002);
  console.log("Server is running on http://localhost:" + port);
});

async function userSeeder() {
  await prisma.user.deleteMany({ where: {} });

  await prisma.user.create({
    data: {
      name: "Alice",
    },
  });

  await prisma.user.create({
    data: {
      name: "Alex",
    },
  });

  console.log("Seeder completed");
}

async function roomSeeder() {
  await prisma.room.deleteMany({ where: {} });

  await prisma.room.create({
    data: {
      name: "Pond",
      total: 4,
      isPrivate: false,
      note: {},
    },
  });

  await prisma.room.create({
    data: {
      name: "Kuy",
      total: 1,
      isPrivate: false,
      note: {},
    },
  });

  console.log("Room seeder is completed.");
}
