import { PrismaClient } from "@prisma/client";
import express from "express";
import bodyParser, { Options } from "body-parser";

import userRouter from "./routers/userRouter";
import roomRouter from "./routers/roomRouter";
import noteRouter from "./routers/noteRouter";
import cookieSession from "cookie-session";
import cors from "cors";

const prisma = new PrismaClient();
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

app.listen(port, async () => {
  await userSeeder();
  //await roomSeeder()
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
