import { PrismaClient } from "@prisma/client";
import express from "express";

const noteRouter = express.Router()
const prisma = new PrismaClient();

//get all notes
noteRouter.get('/' , async(req , res) => {
    const notes = await prisma.note.findMany();
    res.send(notes)
});

//get a note
noteRouter.get('/:id', async(req , res) => {
    const { id } = req.params
    const note = await prisma.note.findUnique({
        where:{
            id,
        },
    });

    if (!note){
        res.status(404).send('Not found note id = ' + id)
        return;
    }

    res.send(note)
});

//Create a note
noteRouter.post('/' , async(req , res) => {
    const { massage , roomId , createdAt } = req.body;
    const createNote = await prisma.note.create({
        data: {
            massage:massage,
            roomId:roomId,
            createdAt:createdAt,
        },
    });

    res.status(201).send(createNote);

});

//Delete a note
noteRouter.delete('/:id' , async (req , res) => {
    const { id } = req.params;
    const foundUser = await prisma.note.findUnique({
      where: {
        id,
      },
    });
  
    if (!foundUser) {
      res.status(404).send("Not found note " + id);
      return;
    }
  
    res.send('Delete note ' + id + ' complete.');
});

//Edit note
noteRouter.put('/:id' , async(req , res) => {
    const { massage , createdAt } = req.body
    const { id } = req.params
    
    const updateNote = await prisma.note.update({
        where: {
            id
        },
        data: {
            massage,
            createdAt,
        },
    });

    if(!updateNote){
        res.status(404).send("Not found note " + id);
        return;
    }

    res.send('Update note ' + id + ' complete.');
});


export default noteRouter