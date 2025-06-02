import { NextFunction, Request, Response } from "express"
import { AnyZodObject, ZodEffects, ZodError } from "zod"

export const validator = (
  schema: AnyZodObject | ZodEffects<ZodEffects<AnyZodObject>>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const parsed = await schema.parseAsync({
        body: req.body as unknown,
        query: req.query as unknown,
        params: req.params as unknown,
      })

      req.body = parsed.body
      req.params = parsed.params
      return next()
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 400,
          message: "request validation failed",
          error,
        })
      }
    }
  }
}
