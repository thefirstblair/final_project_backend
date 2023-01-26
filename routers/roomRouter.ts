import { PrismaClient } from '@prisma/client'
import express from 'express'

const roomRouter = express.Router()

roomRouter.get('/',(req, res) => {
    res.send('Hello room')
})

export default roomRouter