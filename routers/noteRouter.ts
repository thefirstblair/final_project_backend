import { Router } from "express";

const noteRouter = Router()

noteRouter.get('/',(req,res) => {
    res.send('Hello note')
})

export default noteRouter