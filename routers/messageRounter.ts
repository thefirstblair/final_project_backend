import { PrismaClient } from "@prisma/client";
import express from "express";

const messageRouter = express.Router()
const prisma = new PrismaClient();

//get all message
messageRouter.get('/' , async(req , res) => {
    const notes = await prisma.message.findMany();
    res.send(notes)
});

//get a note
messageRouter.get('/:id', async(req , res) => {
    const { id } = req.params
    const message = await prisma.message.findUnique({
        where:{
            id,
        },
    });

    if (!message){
        res.status(404).send('Not found note id = ' + id)
        return;
    }

    res.send(message)
});

//Create message
messageRouter.post('/',async(req , res) =>{

    const {roomId , text , author} = req.body;
    const createMessage = await prisma.message.create({
        data:{
            roomId,
            text,
            author
        }
    });

    res.status(201).send(createMessage);
});