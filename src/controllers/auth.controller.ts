import { authService } from "@/services/auth.service"
import { userService } from "@/services/user.service"
import { RequestError } from "@/utils/errors"
import {
  JWT_ACCESS_TOKEN_COOKIE,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_COOKIE,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
} from "@/utils/jwt"
import { userUtils } from "@/utils/user.utils"
import { Request, Response } from "express"
import { StatusCodes } from "http-status-codes"

const refreshToken = async (req: Request, res: Response) => {
  const refreshTokenCookie = req.cookies[JWT_REFRESH_TOKEN_COOKIE]
  const accessToken = await authService.refreshAccessToken(refreshTokenCookie)

  res
    .cookie(JWT_ACCESS_TOKEN_COOKIE, accessToken, {
      httpOnly: true,
      maxAge: JWT_ACCESS_TOKEN_EXPIRES_IN,
      // secure: true
    })
    .status(StatusCodes.OK)
    .json({ expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN - 1000 * 60 * 5 })
}

const heartbeat = async (req: Request, res: Response) => {
  const user = await userService.getUser({ id: req.user!.userId })

  // ! Add calendar and events

  res.status(StatusCodes.OK).send(userUtils.accountResponseMap(user))
}

const login = async (req: Request, res: Response) => {
  if (!req.body.email || !req.body.password) {
    throw new RequestError(
      StatusCodes.BAD_REQUEST,
      "Email and password are required"
    )
  }

  const tokens = await authService.login(req.body.email, req.body.password)

  res
    .cookie(JWT_ACCESS_TOKEN_COOKIE, tokens.accessTokenJwt, {
      httpOnly: true,
      maxAge: JWT_ACCESS_TOKEN_EXPIRES_IN,
      // secure: true
    })
    .cookie(JWT_REFRESH_TOKEN_COOKIE, tokens.refreshTokenJwt, {
      httpOnly: true,
      maxAge: JWT_REFRESH_TOKEN_EXPIRES_IN,
      // secure: true
    })
    .status(StatusCodes.NO_CONTENT)
    .send()
}

const logout = async (req: Request, res: Response) => {
  if (req.user) {
    const refreshTokenCookie = req.cookies[JWT_REFRESH_TOKEN_COOKIE]
    await authService.logout(refreshTokenCookie)
  }

  res
    .clearCookie(JWT_ACCESS_TOKEN_COOKIE)
    .clearCookie(JWT_REFRESH_TOKEN_COOKIE)
    .status(StatusCodes.NO_CONTENT)
    .send()
}

export const authController = {
  refreshToken,
  heartbeat,
  login,
  logout,
}
