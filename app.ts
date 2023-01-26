import { PrismaClient } from '@prisma/client'
import express from 'express'
import bodyParser from 'body-parser'

import userRouter from './routers/userRouter'
import roomRouter from './routers/roomRouter'

const prisma = new PrismaClient()
const app = express()
const port = 3001

app.use(bodyParser.json())

app.use('/users', userRouter)
app.use('/rooms', roomRouter)

app.listen(port, async () => {
    console.log('Server is running on http://localhost:' + port)
    seeder()
})

async function seeder() {
    await prisma.user.deleteMany({ where: {} })

    await prisma.user.create({
        data: {
            name: 'Alice'
        }
    })

    await prisma.user.create({
        data: {
            name: 'Alex'
        }
    })

    console.log('Seeder completed')
}