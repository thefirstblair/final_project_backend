import { PrismaClient } from "@prisma/client";
import express from "express";
import { io } from "socket.io-client";


const socket = io('http://localhost:3002');
const calendarRouter = express.Router()
const prisma = new PrismaClient();
socket.emit("getMe",'a');
socket.on("me", (data: any) => {
    socket.data.user = data;
});
const { google } = require('googleapis')

const GOOGLE_CLIENT_ID = "773809841935-i4gvn4vtuh2pef46juqsfpn0vt01iliv.apps.googleusercontent.com"
const GOOGLE_CLIENT_SECRET = "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"

// REFRESH_TOKEN has to store to database

const REFRESH_TOKEN = '1//0gr-ZeOKmxld5CgYIARAAGBASNwF-L9IrimNFdQ1DDHlfpS…X44qya4VNFNjrfyVNJ2-XPo-bG-3FNK5INCk-x-L-mM0V4utM'

const oauth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'http://localhost:3000'
)
// calendarRouter.get('/', async (req, res, next) => {
//     res.send({message: 'OK api is working!'})
// })

calendarRouter.post('/create-tokens', async (req, res, next) => {
    try {
        const { code } = req.body
        const { tokens } = await oauth2Client.getToken(code)
        res.send(tokens)
    } catch (error) {
        next(error)
    }
})

calendarRouter.post('/create-event', async (req, res, next) => {
    try {
        const { summary, description, place, startDateTime, endDateTime } = req.body
        oauth2Client.setCredentials({refreshToken: REFRESH_TOKEN})
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
                attendees: [
                    {email: "phantouch.s@ku.th"},
                    {email: "thyrnf@gmail.com"}
                ]
            }
        })
        res.send(response)
    } catch (error) {
        next(error)
    }
})

export default calendarRouter