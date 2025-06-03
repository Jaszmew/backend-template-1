import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { client } from "@/db/prisma"
import { RequestError } from "@/utils/errors"
// import { emailUtils } from "../../utils/email"
import { ChangePassword, UserQueryParams, userUtils } from "@/utils/user.utils"
import { StatusCodes } from "http-status-codes"

// Functions as a get all users when used without params
const getUsersBasedOnParams = async (params: UserQueryParams) => {
  const whereConditions: Prisma.AccountWhereInput = {}

  if (params.emailContains) {
    whereConditions.email = {
      contains: params.emailContains,
      mode: "insensitive",
    }
  }

  const users = await client.account.findMany({
    where: whereConditions,
    select: userUtils.accountSelectInput,
  })

  return users
}

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
  input: ChangePassword,
  userData: Prisma.UserUpdateInput
) => {
  const user = await client.account.findUniqueOrThrow({ where: unique })

  if (
    typeof input.newPassword === "string" &&
    typeof input.oldPassword === "string"
  ) {
    if (!input.oldPassword) {
      throw new RequestError(
        StatusCodes.BAD_REQUEST,
        "Current password missing"
      )
    }

    // Force current password entry to update user data
    const isOldPasswordCorrect = await bcrypt.compare(
      input.oldPassword,
      user.password
    )
    if (!isOldPasswordCorrect) {
      throw new RequestError(StatusCodes.BAD_REQUEST, "Incorrect password")
    }

    // Compare new password to existing in case they are the same
    const passwordMatchesOld = await bcrypt.compare(
      input.newPassword,
      user.password
    )
    if (passwordMatchesOld) {
      throw new RequestError(
        StatusCodes.BAD_REQUEST,
        "New password cannot be the same as your old password."
      )
    }
    input.newPassword = await bcrypt.hash(input.newPassword, 10)
  }

  await client.account.update({
    where: unique,
    data: {
      password: input.newPassword,
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
  getUsersBasedOnParams,
  getUser,
  create,
  update,
  confirmUserEmail,
  removeUser,
  requestPasswordReset,
  resetPassword,
}
