import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import { auth } from "express-oauth2-jwt-bearer"
import { authRouter } from "./routes/auth.router"
import { userRouter } from "./routes/user.router"

dotenv.config()

const app = express()

// Middlewares

// Cors config
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN_URL,
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
    optionsSuccessStatus: 204,
  })
)
// Auth0 JWT validation middleware
const jwtCheck = auth({
  issuerBaseURL: process.env.AUTH0_DOMAIN,
  audience: process.env.AUTH0_AUDIENCE,
  tokenSigningAlg: "RS256",
})

// Enforce on all endpoints
app.use(jwtCheck)

app.use(express.json())

app.use("/user", userRouter)
app.use("/auth", authRouter)

export default app
