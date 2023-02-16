import { PrismaClient } from '@prisma/client'
import express from 'express'

const roomRouter = express.Router()
const prisma = new PrismaClient();


//get all rooms 
roomRouter.get('/' , async(req , res) => {
    const rooms = await prisma.room.findMany();
    res.send(rooms);
});

//get a room
roomRouter.get('/:id', async(req , res) => {
    const { id } = req.params
    const room = await prisma.room.findUnique({
        where:{
            id,
        },
    });

    if (!room){
        res.status(404).send('Not found room id = ' + id)
        return;
    }

    res.send(room)
});

//Create a room
roomRouter.post('/' , async(req , res) => {
    const { name , total , isPrivate } = req.body;
    const createRoom = await prisma.room.create({
        data: {
            name,
            isPrivate,
        },
    });

    res.status(201).send(createRoom);
});

//Delete a note
roomRouter.delete('/:id' , async (req , res) => {
    const { id } = req.params;
    const foundRoom = await prisma.room.findUnique({
      where: {
        id,
      },
    });
  
    if (!foundRoom) {
      res.status(404).send("Not found room " + id);
      return;
    }
  
    res.send('Delete room ' + id + ' complete.');
});

export default roomRouter