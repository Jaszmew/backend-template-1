import { StatusCodes } from "http-status-codes"

export class RequestError extends Error {
  status: number
  error: unknown

  constructor(status: StatusCodes, message: string, error?: unknown) {
    super(message)
    this.status = status
    this.error = error
  }
}
