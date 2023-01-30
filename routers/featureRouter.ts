import { PrismaClient } from "@prisma/client";
import express from "express";

const featureRouter = express.Router()
const prisma = new PrismaClient();

const words = ['Horoscope 1', 'Horoscope 2', 'Horoscope 3', 'Horoscope 4', 'Horoscope 5'];

function generateRandomWord() {
    const randomIndex = Math.floor(Math.random() * words.length);
    return words[randomIndex];
}

featureRouter.get('/random-word', async (req, res) => {
    const randomWord = generateRandomWord();
    res.send({ word: randomWord });
  });
  
  export default featureRouter