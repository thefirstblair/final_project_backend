import { PrismaClient } from "@prisma/client";
import express from "express";


const calendarRouter = express.Router()
const prisma = new PrismaClient();

const { google } = require('googleapis')

const GOOGLE_CLIENT_ID = "773809841935-i4gvn4vtuh2pef46juqsfpn0vt01iliv.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

// REFRESH_TOKEN has to store to database

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'http://localhost:3000'
)

const scopes = ['https://www.googleapis.com/auth/calendar']
// calendarRouter.get('/', async (req, res, next) => {
//     res.send({message: 'OK api is working!'})
// })

calendarRouter.post('/create-tokens', async (req, res, next) => {
    try {
        const { id } = req.body
        const { code } = req.body
        const { tokens } = await oauth2Client.getToken(code)
        console.log(tokens)
        const { refresh_token } = tokens
        const user = await prisma.user.update({
            where: {
                id: id
            },
            data: {
                refreshToken: refresh_token
            }
        });
        console.log("This is User" , user)
        res.send(tokens)
    } catch (error) {
        next(error)
    }
})

calendarRouter.post('/create-event', async (req, res, next) => {
    try {
        const { summary, description, place, startDateTime, endDateTime, id, attendeesMail } = req.body
        console.log(id)
        const user = await prisma.user.findUnique({ where: { id } })
        oauth2Client.setCredentials({ refresh_token: user?.refreshToken })
        const calendar = google.calendar('v3')
        const response = await calendar.events.insert({
            auth: oauth2Client,
            calendarId: 'primary',
            requestBody: {
                summary: summary,
                description: description,
                location: place,
                colorId: '6',
                // colorId : 1 blue, 2 green, 3 purple, 4 red, 5 yellow, 6 orange
                start: {
                    dateTime: new Date(startDateTime)
                },
                end: {
                    dateTime: new Date(endDateTime)
                },
                attendees: attendeesMail
                , guestsCanSeeOtherGuests: false
                
            }
        })
        res.send(response)
    } catch (error) {
        next(error)
    }
})

export default calendarRouter