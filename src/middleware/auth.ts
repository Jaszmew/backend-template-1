import { Request, Response, NextFunction } from "express"
import { StatusCodes } from "http-status-codes"
import jwt from "jsonwebtoken"
import { client } from "@/db/prisma"
import { RequestError } from "@/utils/errors"
import {
  JWT_ACCESS_TOKEN_COOKIE,
  JWT_ACCESS_TOKEN_PUBLIC_KEY,
  JWT_ALG,
  JWT_ISSUER,
  JwtTokenPayload,
} from "@/utils/jwt"

function verifyAndContinue(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[JWT_ACCESS_TOKEN_COOKIE] as string

  if (!token) {
    return next()
  }

  jwt.verify(
    token,
    JWT_ACCESS_TOKEN_PUBLIC_KEY,
    { algorithms: [JWT_ALG], issuer: JWT_ISSUER },
    async (err, decoded) => {
      if (err || !decoded) {
        res.clearCookie("auth-token")
        return next()
      }
      req.user = decoded as JwtTokenPayload

      const user = await client.user.findUnique({
        where: { id: req.user.userId },
      })
      if (!user) {
        res.clearCookie("auth-token")
        throw new RequestError(StatusCodes.UNAUTHORIZED, "Invalid token")
      }

      next()
    }
  )
}

function verifyOrThrow(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies[JWT_ACCESS_TOKEN_COOKIE] as string

  if (!token) {
    throw new RequestError(StatusCodes.UNAUTHORIZED, "Not logged in")
  }

  jwt.verify(
    token,
    JWT_ACCESS_TOKEN_PUBLIC_KEY,
    {
      algorithms: [JWT_ALG],
      issuer: JWT_ISSUER,
    },
    async (err, decoded) => {
      if (err || !decoded) {
        res.clearCookie("auth-token")
        throw new RequestError(StatusCodes.UNAUTHORIZED, "Invalid token")
      }

      req.user = decoded as JwtTokenPayload

      const user = await client.user.findUnique({
        where: { id: req.user.userId },
      })
      if (!user) {
        res.clearCookie("auth-token")
        throw new RequestError(StatusCodes.UNAUTHORIZED, "Invalid token")
      }

      next()
    }
  )
}

export const authMiddleware = {
  verifyAndContinue,
  verifyOrThrow,
}
