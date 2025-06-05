import cors from "cors"
import express from "express"
import { authRouter } from "./routes/auth.router"
import { userRouter } from "./routes/user.router"

const app = express()

// Middleware
app.use(cors())
app.use(express.json())

app.use("/user", userRouter)
app.use("/auth", authRouter)

export default app
