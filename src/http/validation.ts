import type { RequestHandler } from "express";
import type { ZodSchema } from "zod";
import { ErrorCode, errorMessages } from "../domain/errors";

export function validateBody(schema: ZodSchema): RequestHandler {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      res.status(400).json({
        error: {
          code: ErrorCode.ValidationError,
          message: errorMessages[ErrorCode.ValidationError]
        }
      });
      return;
    }

    req.body = result.data;
    next();
  };
}
