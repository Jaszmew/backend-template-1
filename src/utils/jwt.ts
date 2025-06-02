import { Privilege } from "@prisma/client"
import { JwtPayload } from "jsonwebtoken"
import fs from "node:fs"
import path from "node:path"

// Constants
export const JWT_ALG = "RS256"
export const JWT_ISSUER = "KumoSo"
export const JWT_REFRESH_TOKEN_EXPIRES_IN = 1000 * 60 * 60 * 24 * 30 // 30 days
export const JWT_ACCESS_TOKEN_EXPIRES_IN = 1000 * 60 * 15 // 15 minutes

export const JWT_ACCESS_TOKEN_COOKIE = "access-token"
export const JWT_REFRESH_TOKEN_COOKIE = "refresh-token"

// Keys
export const JWT_REFRESH_TOKEN_PRIVATE_KEY = fs.readFileSync(
  path.join(process.cwd(), "certs", "JWT_REFRESH_TOKEN_RS256.key")
)
export const JWT_REFRESH_TOKEN_PUBLIC_KEY = fs.readFileSync(
  path.join(process.cwd(), "certs", "JWT_REFRESH_TOKEN_RS256.key.pub")
)
export const JWT_ACCESS_TOKEN_PRIVATE_KEY = fs.readFileSync(
  path.join(process.cwd(), "certs", "JWT_ACCESS_TOKEN_RS256.key")
)
export const JWT_ACCESS_TOKEN_PUBLIC_KEY = fs.readFileSync(
  path.join(process.cwd(), "certs", "JWT_ACCESS_TOKEN_RS256.key.pub")
)

// Interfaces
export interface JwtTokenPayload extends JwtPayload {
  userId: string
  privilege: Privilege
}

export type JwtAccessTokenPayload = JwtTokenPayload

export interface JwtRefreshTokenPayload extends JwtTokenPayload {
  refreshTokenId: string
}

// Extend Request interface to include user property with JwtTokenPayload type
declare module "express" {
  interface Request {
    user?: JwtTokenPayload
  }
}
