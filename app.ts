import { PrismaClient } from '@prisma/client'
import express from 'express'
import bodyParser, { Options } from 'body-parser'

import userRouter from './routers/userRouter'
import roomRouter from './routers/roomRouter'
import noteRouter from './routers/noteRouter'

const prisma = new PrismaClient()
const app = express()
const port = 3001

app.use(bodyParser.json())

app.use('/users', userRouter)
app.use('/rooms', roomRouter)
app.use('/notes', noteRouter)

app.listen(port, async () => {
    await userSeeder()
    await roomSeeder()
    console.log('Server is running on http://localhost:' + port)
})

async function userSeeder() {
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

async function roomSeeder() {
    await prisma.room.deleteMany({ where: {}})

    await prisma.room.create({
        data: {
            name: 'Pond',
            total: 4,
            private: false,
            note: {}
        }
    })

    await prisma.room.create({
        data: {
            name: 'Kuy',
            total: 1,
            private: false,
            note: {}
        }
    })

    console.log('Room seeder is completed.')

    
}

