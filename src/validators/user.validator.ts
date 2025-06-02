import { z } from "zod"

const firstName = z
  .string()
  .min(1, { message: "First name is required" })
  .max(50)
const lastName = z.string().min(1, { message: "Last name is required" }).max(50)
const email = z
  .string()
  .email()
  .refine((email) => email.endsWith("@kumoso.fi"))

const password = z
  .string()
  .min(8, { message: "Password must be at least 8 characters long." })
  .max(40, { message: "Password must be 40 characters or fewer." })
  .refine((val) => /[A-Z]/.test(val), {
    message: "Password must contain at least one uppercase letter.",
  })
  .refine((val) => /[a-z]/.test(val), {
    message: "Password must contain at least one lowercase letter.",
  })
  .refine((val) => /\d/.test(val), {
    message: "Password must contain at least one digit.",
  })
// .refine((val) => /[\W_]/.test(val), {
//   message: "Password must contain at least one special character.",
// })

const getUserByIdValidator = z.object({
  params: z.object({
    userId: z.string(),
  }),
})

const createUserValidator = z.object({
  body: z.object({
    firstName,
    lastName,
    email,
    password,
    timezone: z.string().optional(),
  }),
})

const updateUserValidator = z.object({
  query: z.object({
    id: z.string(),
  }),
  body: z.object({
    firstName: firstName.optional(),
    lastName: lastName.optional(),
  }),
})

const confirmUserEmailValidator = z.object({
  query: z.object({
    token: z.string(),
    userId: z.string(),
  }),
})

const requestPasswordResetValidator = z.object({
  body: z.object({
    email: email,
  }),
})

const resetPasswordValidator = z.object({
  body: z.object({
    resetToken: z.string().min(1, { message: "Reset token is required" }),
    newPassword: password,
  }),
})

export const userValidator = {
  getUserByIdValidator,
  createUserValidator,
  updateUserValidator,
  confirmUserEmailValidator,
  requestPasswordResetValidator,
  resetPasswordValidator,
}
