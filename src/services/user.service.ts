import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { client } from "@/db/prisma"
import { RequestError } from "@/utils/errors"
// import { emailUtils } from "../../utils/email"
import { userUtils } from "@/utils/user.utils"
import { StatusCodes } from "http-status-codes"

// Get all users
const getAll = async () => {
  return await client.user.findMany()
}

// Can be returned to the client
const getUser = async (unique: Prisma.AccountWhereUniqueInput) => {
  const user = await client.account.findUnique({
    where: unique,
    select: userUtils.accountSelectInput,
  })

  if (!user) {
    throw new RequestError(StatusCodes.NOT_FOUND, "User not found!")
  }
  return user
}

const getMultipleUsers = async (input: Prisma.UserWhereInput) => {
  return await client.user.findMany({
    where: input,
    select: userUtils.accountSelectInput,
  })
}

const create = async (
  input: Prisma.AccountCreateInput,
  userInput: Prisma.UserCreateWithoutAccountInput
) => {
  const existingUser = await client.account.findUnique({
    where: { email: input.email },
  })

  if (existingUser) {
    throw new RequestError(StatusCodes.CONFLICT, "Account already exists")
  }

  const hash = await bcrypt.hash(input.password, 10)

  const account = await client.account.create({
    data: {
      ...input,
      password: hash,
      user: {
        create: {
          ...userInput,
        },
      },
    },
  })

  // ! Email confirmation system not implemented yet
  const emailConfirmationToken = crypto.randomUUID()
  await client.accountConfirmationToken.create({
    data: {
      token: emailConfirmationToken,
      type: "EMAIL_CONFIRMATION",
      accountId: account.id,
    },
  })
}

const update = async (
  unique: Prisma.AccountWhereUniqueInput,
  input: Prisma.AccountUpdateInput,
  userData: Prisma.UserUpdateInput
) => {
  const user = await client.account.findUniqueOrThrow({ where: unique })
  if (typeof input.password === "string") {
    const passwordMatchesOld = await bcrypt.compare(
      input.password,
      user.password
    )
    if (passwordMatchesOld) {
      throw new RequestError(
        StatusCodes.BAD_REQUEST,
        "New password cannot be the same as your old password."
      )
    }
    input.password = await bcrypt.hash(input.password, 10)
  }

  await client.account.update({
    where: unique,
    data: {
      ...input,
      user: {
        update: userData,
      },
    },
  })
}

// ! Not implemented yet
const confirmUserEmail = async (userId: string, token: string) => {
  await client.account.update({
    where: { id: userId },
    data: {
      isEmailConfirmed: true,
    },
  })

  await client.accountConfirmationToken.delete({ where: { token } })
}

const removeUser = async (unique: Prisma.UserWhereUniqueInput) => {
  await client.user.delete({
    where: unique,
  })
}

// Function to request password reset
const requestPasswordReset = async (input: { email: string }) => {
  try {
    const user = await client.account.findUnique({
      where: { email: input.email },
    })
    if (user) {
      const token = crypto.randomUUID()
      const expireTimer = new Date(Date.now() + 900000) // 15 minutes timer for a valid token

      await client.accountConfirmationToken.create({
        data: {
          token,
          type: "FORGOT_PASSWORD",
          accountId: user.id,
          expiredAt: expireTimer,
        },
      })

      // ! Need to create reset link config

      // ! Need to create function to send email
    }
  } catch {
    throw new RequestError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "An error occurred while requesting password reset"
    )
  }
}

const verifyResetToken = async (token: string) => {
  const resetToken = await client.accountConfirmationToken.findFirst({
    where: {
      token,
      type: "FORGOT_PASSWORD",
      expiredAt: {
        gt: new Date(),
      },
    },
    include: {
      account: true,
    },
  })
  if (!resetToken) {
    throw new RequestError(StatusCodes.BAD_REQUEST, "Invalid or expired token")
  }
  return resetToken.account
}

const resetPassword = async (token: string, newPassword: string) => {
  const user = await verifyResetToken(token)

  const passwordMatchesOld = await bcrypt.compare(newPassword, user.password)

  if (passwordMatchesOld) {
    throw new RequestError(
      StatusCodes.BAD_REQUEST,
      "New password cannot be the same as your old password."
    )
  }

  const hash = await bcrypt.hash(newPassword, 10)

  await client.account.update({
    where: { id: user.id },
    data: {
      password: hash,
    },
  })

  await client.accountConfirmationToken.delete({ where: { token } })

  // ! create a function and utils to send confirmation email
}

export const userService = {
  getAll,
  getUser,
  getMultipleUsers,
  create,
  update,
  confirmUserEmail,
  removeUser,
  requestPasswordReset,
  resetPassword,
}
