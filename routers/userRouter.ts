import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const userRouter = express.Router();

//Get all users
userRouter.get("/", async (req, res) => {
  const users = await prisma.user.findMany();

  res.send(users);
});

//Get me from session
userRouter.get("/me", (req, res) => {
  const user = req.session?.user;

  if (!user) {
    res.status(404).send("Not found user from your session");
    return;
  }

  res.send(user);
});

//Get single user
userRouter.get("/:id", async (req, res) => {
  const { id } = req.params;
  const foundUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!foundUser) {
    res.status(404).send("Not found user " + id);
    return;
  }

  res.send(foundUser);
});

//Create a user
userRouter.post("/", async (req, res) => {
  const { name } = req.body;

  const createdUser = await prisma.user.create({
    data: {
      name,
      room:{
        connectOrCreate:{
          create:{
            name:'Lobby'
          },
          where:{
            id:""
          }
        }
      }
    },
  });

  if (req.session) {
    req.session.user = createdUser;
  }

  res.status(201).send(createdUser);
});

//Logout from session
userRouter.delete("/logout", async (req, res) => {
  try {
    await prisma.user.delete({
      where: {
        id: req.session?.user.id,
      },
    });
  }catch(err){
    console.log(err)
  }

  req.session = null;

  res.status(204).send();
});

//Delete a user
userRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;
  const foundUser = await prisma.user.findUnique({
    where: {
      id,
    },
  });

  if (!foundUser) {
    res.status(404).send("Not found user " + id);
    return;
  }

  res.send("Delete user " + id + " complete.");
});


//Update user room
userRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { roomId } = req.body;

  const updateUser = await prisma.user.update({
    where:{
      id,
    },
    data:{
      room:{
        // disconnect: true
      }
    }
  });

  if (!updateUser) {
    res.status(404).send("Not found user " + id);
    return;
  }

  res.send("Update user " + id + " complete.");
});

export default userRouter;
