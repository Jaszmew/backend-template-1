import { client } from "@/db/prisma"
import { authUtils } from "@/utils/auth.utils"
import { RequestError } from "@/utils/errors"
import {
  JWT_ALG,
  JWT_ISSUER,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_PUBLIC_KEY,
  JwtRefreshTokenPayload,
} from "@/utils/jwt"
import { Prisma } from "@prisma/client"
import bcrypt from "bcryptjs"
import { StatusCodes } from "http-status-codes"
import jwt from "jsonwebtoken"

const refreshAccessToken = async (refreshToken: string) => {
  const payload = jwt.verify(refreshToken, JWT_REFRESH_TOKEN_PUBLIC_KEY, {
    algorithms: [JWT_ALG],
    issuer: JWT_ISSUER,
  }) as JwtRefreshTokenPayload

  const refreshTokenExists = await client.refreshToken.findFirst({
    where: {
      token: payload.refreshTokenId,
      accountId: payload.accountId,
    },
    select: {
      token: true,
    },
  })

  if (!refreshTokenExists) {
    throw new RequestError(StatusCodes.NOT_FOUND, "Refresh token not found")
  }

  const token = authUtils.createAccessToken({
    accountId: payload.accountId,
    privilege: payload.privilege,
  })

  return token
}

const login = async (email: string, password: string) => {
  const account = await client.account.findUnique({ where: { email: email } })

  if (!account) {
    throw new RequestError(StatusCodes.NOT_FOUND, "Invalid credentials")
  }

  // if (!user.isEmailConfirmed) {
  //   throw new RequestError(StatusCodes.FORBIDDEN, "Email not confirmed")
  // }

  const isPasswordCorrect = await bcrypt.compare(password, account.password)

  if (!isPasswordCorrect) {
    throw new RequestError(StatusCodes.UNAUTHORIZED, "Invalid credentials")
  }

  const refreshToken = await client.refreshToken.create({
    data: {
      expiresAt: new Date(Date.now() + JWT_REFRESH_TOKEN_EXPIRES_IN),
      accountId: account.id,
    },
    select: { token: true },
  })

  if (!refreshToken) {
    throw new RequestError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to create token"
    )
  }

  const refreshTokenJwt = authUtils.createRefreshToken({
    refreshTokenId: refreshToken.token,
    accountId: account.id,
    privilege: account.privilege,
  })

  const accessTokenJwt = authUtils.createAccessToken({
    accountId: account.id,
    privilege: account.privilege,
  })

  return {
    refreshTokenJwt,
    accessTokenJwt,
  }
}

const logout = async (tokenInput: Prisma.RefreshTokenWhereUniqueInput) => {
  await client.refreshToken.delete({
    where: tokenInput,
  })
}

export const authService = {
  refreshAccessToken,
  login,
  logout,
}
