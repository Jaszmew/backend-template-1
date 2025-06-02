import { validator } from "@/middleware/validator"
import express from "express"
import { userValidator } from "@/validators/user.validator"
import { userController } from "@/controllers/user.controller"

export const userRouter = express.Router()

// Get all users
userRouter.get("/", userController.getAllUsers)

// Get user by ID
userRouter.get(
  "/:userId",
  validator(userValidator.getUserByIdValidator),
  userController.getUser
)

userRouter.post(
  "/",
  validator(userValidator.createUserValidator),
  userController.createAccount
)
