import { Privilege } from "@prisma/client"
import { Request, Response, NextFunction } from "express"
import { StatusCodes } from "http-status-codes"
import { RequestError } from "@/utils/errors"
import { permissionMap } from "@/utils/permission"

// Handles user permissions, to check permission list go to /utils/permissions.ts

const hasPrivilege = (privilege: Privilege) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = req.user

    if (!permissionMap[privilege].includes(user!.privilege)) {
      throw new RequestError(StatusCodes.FORBIDDEN, "Invalid token")
    }

    next()
  }
}

const isUser = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user

  if (!permissionMap[Privilege.USER].includes(user!.privilege)) {
    throw new RequestError(StatusCodes.FORBIDDEN, "Invalid token")
  }

  next()
}

const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user

  if (!permissionMap[Privilege.ADMIN].includes(user!.privilege)) {
    throw new RequestError(StatusCodes.FORBIDDEN, "Invalid token")
  }

  next()
}

const isSuperAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = req.user

  if (!permissionMap[Privilege.SUPERADMIN].includes(user!.privilege)) {
    throw new RequestError(StatusCodes.FORBIDDEN, "Invalid token")
  }

  next()
}

export const permissionMiddleware = {
  hasPrivilege,
  isUser,
  isAdmin,
  isSuperAdmin,
}
