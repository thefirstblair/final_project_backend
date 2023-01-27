import { PrismaClient } from "@prisma/client";
import express from "express";

const prisma = new PrismaClient();
const userRouter = express.Router();

//Get all users
userRouter.get("/", async (req, res) => {
  const users = await prisma.user.findMany();

  res.send(users);
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
    },
  });

  res.status(201).send(createdUser);
});

//Delete a user
userRouter.delete('/:id' , async (req , res) => {
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

  res.send('Delete user ' + id + ' complete.');
});

//Update user name
userRouter.put('/:id' , async(req , res) => {
  const {id} = req.params;
  const {name} = req.body;

  const updateUser = await prisma.user.update({
    where:{
      id
    },
    data:{
      name
    }
  });

  if (!updateUser) {
    res.status(404).send("Not found user " + id);
    return;
  }

  res.send('Update user ' + id + ' complete.');
});

export default userRouter;
