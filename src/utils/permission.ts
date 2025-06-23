import { Privilege } from "@prisma/client"

// The following is outdated and has been moved to Auth0

type PermissionMap = {
  [key in Privilege]: Privilege[]
}

export const permissionMap: PermissionMap = {
  USER: [Privilege.USER, Privilege.ADMIN, Privilege.SUPERADMIN],
  ADMIN: [Privilege.ADMIN, Privilege.SUPERADMIN],
  SUPERADMIN: [Privilege.SUPERADMIN],
}
