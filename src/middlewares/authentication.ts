import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError'
import * as jwt from 'jsonwebtoken'

export const authentication = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  ;
  

  if (!token) {
    return res.status(401).json(new ApiError(401, 'Unauthorized user'))
  }

  jwt.verify(
    token,
    process.env.ACCESS_TOKEN_SECRET as string,
    (err, decoded) => {
      if (err) {
        return res
          .status(401)
          .json(new ApiError(401, 'Failed to authenticate user'))
      }
      ;(req as any).user = decoded
      next()
    },
  )
}
