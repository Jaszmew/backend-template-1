import { authController } from "@/controllers/auth.controller"
import { authMiddleware } from "@/middleware/auth"
import express from "express"

export const authRouter = express.Router()

// Token verification
authRouter.get(
  "/heartbeat",
  authMiddleware.verifyOrThrow,
  authController.heartbeat
)

// Refresh token
authRouter.get("/refresh-token", authController.refreshToken)

// Login
authRouter.post("/login", authController.login)

// Logout
authRouter.delete("/logout", authController.logout)
