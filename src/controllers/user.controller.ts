import { Privilege } from "@prisma/client"
import { Request, Response } from "express"
import { z } from "zod"
import { StatusCodes } from "http-status-codes"
import { userUtils } from "@/utils/user.utils"
import { userValidator } from "@/validators/user.validator"
import { userService } from "@/services/user.service"

// ! Fine for now, possibly dangerous later
const getAllUsers = async (req: Request, res: Response) => {
  const users = await userService.getAll()

  res.status(StatusCodes.OK).json(users)
}

const getUser = async (req: Request, res: Response) => {
  const params = req.query as z.infer<
    typeof userValidator.getUserByIdValidator
  >["params"]

  const userId = params.userId

  const user = await userService.getUser({
    id: userId,
  })

  res.status(StatusCodes.OK).json(userUtils.accountResponseMap(user))
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

export const userController = {
  getAllUsers,
  getUser,
  createAccount,
}
