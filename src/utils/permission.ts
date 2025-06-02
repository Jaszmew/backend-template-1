import { Privilege } from "@prisma/client"

type PermissionMap = {
  [key in Privilege]: Privilege[]
}

export const permissionMap: PermissionMap = {
  USER: [Privilege.USER, Privilege.ADMIN, Privilege.SUPERADMIN],
  ADMIN: [Privilege.ADMIN, Privilege.SUPERADMIN],
  SUPERADMIN: [Privilege.SUPERADMIN],
}
