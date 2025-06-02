import { validator } from "@/middleware/validator"
import express from "express"
import { userValidator } from "@/validators/user.validator"
import { userController } from "@/controllers/user.controller"
import { authMiddleware } from "@/middleware/auth"

export const userRouter = express.Router()

// Get all users or search users based on params
userRouter.get(
  "/",
  // authMiddleware.verifyOrThrow,
  validator(userValidator.getUsersBasedOnParamsValidator),
  userController.getUsersBasedOnParams
)

// Get user by ID
userRouter.get(
  "/:userId",
  // authMiddleware.verifyOrThrow,
  validator(userValidator.getUserByIdValidator),
  userController.getUser
)

// Create a user account
userRouter.post(
  "/",
  // authMiddleware.verifyOrThrow,
  validator(userValidator.createUserValidator),
  userController.createAccount
)

// Update user data
userRouter.put(
  "/update",
  // authMiddleware.verifyOrThrow,
  validator(userValidator.updateUserValidator),
  userController.updateAccount
)
