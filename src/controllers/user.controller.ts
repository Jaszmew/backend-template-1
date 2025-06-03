import { Privilege } from "@prisma/client"
import { Request, Response } from "express"
import { z } from "zod"
import { StatusCodes } from "http-status-codes"
import { userUtils } from "@/utils/user.utils"
import { userValidator } from "@/validators/user.validator"
import { userService } from "@/services/user.service"
import { RequestError } from "@/utils/errors"

// When used without params, gets all users
// ! Need to create a proper validator, once search params are known
const getUsersBasedOnParams = async (req: Request, res: Response) => {
  const params = req.query as z.infer<
    typeof userValidator.getUsersBasedOnParamsValidator
  >["params"]

  const users = await userService.getUsersBasedOnParams(params)

  res.status(StatusCodes.OK).json(users)
}

// Get single user by ID
const getUser = async (req: Request, res: Response) => {
  const params = req.params as z.infer<
    typeof userValidator.getUserByIdValidator
  >["params"]

  const userId = params.userId ?? req.user!.userId

  const user = await userService.getUser({
    id: userId,
  })

  res.status(StatusCodes.OK).json(user)
}

const createAccount = async (req: Request, res: Response) => {
  const body = req.body as z.infer<
    typeof userValidator.createUserValidator
  >["body"]

  const accountData = {
    email: body.email,
    password: body.password,
  }

  const userData = {
    firstName: body.firstName,
    lastName: body.lastName,
    // timezone: body.timezone
  }

  await userService.create(accountData, userData)
  res.sendStatus(StatusCodes.CREATED)
}

const updateAccount = async (req: Request, res: Response) => {
  const body = req.body as z.infer<
    typeof userValidator.updateUserValidator
  >["body"]

  const id = req.query as z.infer<
    typeof userValidator.updateUserValidator
  >["query"]

  const accountData = {
    oldPassword: body.oldPassword,
    newPassword: body.newPassword,
  }

  const userData = {
    firstName: body.firstName,
    lastName: body.lastName,
    timezone: body.timezone,
  }

  await userService.update(id, accountData, userData)
  res.sendStatus(StatusCodes.OK)
}

const deleteUserById = async (req: Request, res: Response) => {
  const { userId } = req.params as z.infer<
    typeof userValidator.getUserByIdValidator
  >["params"]

  await userService.removeUser({ id: userId })
  res.sendStatus(StatusCodes.NO_CONTENT)
}

export const userController = {
  getUsersBasedOnParams,
  getUser,
  createAccount,
  updateAccount,
  deleteUserById,
}
