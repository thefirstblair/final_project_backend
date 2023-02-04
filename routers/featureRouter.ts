import { PrismaClient } from "@prisma/client";
import express from "express";

const featureRouter = express.Router()
const prisma = new PrismaClient();

const words = ['A light heart carries you through all the hard times.', 
'A lifetime of happiness lies ahead of you.', 
'The smart thing to do is to begin trusting your intuitions.', 
'Strong reasons make strong actions. ', 
"Don't let your limitations overshadow your talents"
, 'Practice makes perfect.', 'Your talents will be recognized and suitably rewarded.'];

function generateRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

featureRouter.get('/random-word', async (req, res) => {
    const randomWord = generateRandomWord();
    res.send({ word: randomWord });
  });
  
  export default featureRouter