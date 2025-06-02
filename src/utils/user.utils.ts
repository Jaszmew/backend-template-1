import { Prisma } from "@prisma/client"

type PrismaAccountPayload = Prisma.AccountGetPayload<{
  select: typeof accountSelectInput
}>

const accountSelectInput = Prisma.validator<Prisma.AccountSelect>()({
  id: true,
  email: true,
  user: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      timeZone: true,
    },
  },
})

const accountResponseMap = (account: PrismaAccountPayload) => {
  return {
    id: account.id,
    email: account.email,
    firstName: account.user?.firstName,
    lastName: account.user?.lastName,
    timezone: account.user?.timeZone,
  }
}

export type ChangePassword = {
  newPassword: string | undefined
  oldPassword: string | undefined
}

export interface UserQueryParams {
  /* 
  Add params here
  privilege?: Privilege
  available: Available 
  etc
  */
  emailContains?: string
}

export const userUtils = {
  accountSelectInput,

  accountResponseMap,
}
