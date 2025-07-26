import { NextFunction, Request, Response } from 'express'
import { ApiError } from '../utils/ApiError'
import prisma from '../prisma/client'

export const authorization = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const user = (req as any).user // Access the user data attached in the authentication middleware
  if (!user) {
    return res.status(403).json(new ApiError(403, 'Forbidden: No user data'))
  }

  // Check if the email exists in the user object
  if (!user.data.email) {
    return res
      .status(400)
      .json(new ApiError(400, 'Bad Request: Email is missing in user data'))
  }

  try {
    // Find the user by their email
    const foundUser = await prisma.user.findUnique({
      where: {
        email: user.data.email,
      },
    })
    if (!foundUser) {
      return res
        .status(403)
        .json(new ApiError(403, 'Forbidden: User not found'))
    }

    // Ensure the user is a service provider
    if (!foundUser.isServiceProvider) {
      return res
        .status(403)
        .json(new ApiError(403, 'Forbidden: Not a service provider'))
    }

    // User is authorized, move to the next middleware or route handler
    next()
  } catch (error) {
    console.error(error)
    return res.status(500).json(new ApiError(500, 'Internal Server Error'))
  }
}
