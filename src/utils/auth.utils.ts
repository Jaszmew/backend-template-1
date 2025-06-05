import jwt from "jsonwebtoken"

import {
  JWT_ALG,
  JWT_ISSUER,
  JWT_ACCESS_TOKEN_PRIVATE_KEY,
  JWT_ACCESS_TOKEN_EXPIRES_IN,
  JWT_REFRESH_TOKEN_PRIVATE_KEY,
  JWT_REFRESH_TOKEN_EXPIRES_IN,
  JwtAccessTokenPayload,
  JwtRefreshTokenPayload,
} from "./jwt"

const createAccessToken = (payload: JwtAccessTokenPayload) => {
  return jwt.sign(payload, JWT_ACCESS_TOKEN_PRIVATE_KEY, {
    algorithm: JWT_ALG,
    issuer: JWT_ISSUER,
    expiresIn: JWT_ACCESS_TOKEN_EXPIRES_IN,
  })
}

const createRefreshToken = (payload: JwtRefreshTokenPayload) => {
  return jwt.sign(payload, JWT_REFRESH_TOKEN_PRIVATE_KEY, {
    algorithm: JWT_ALG,
    issuer: JWT_ISSUER,
    expiresIn: JWT_REFRESH_TOKEN_EXPIRES_IN,
  })
}

export const authUtils = {
  createAccessToken,
  createRefreshToken,
}
