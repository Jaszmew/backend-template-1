import express from "express"
import cors from "cors"
import { userRouter } from "./routes/user.router"

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

app.use("/user", userRouter)

export default app
