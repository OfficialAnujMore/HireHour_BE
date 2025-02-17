import { Request, Response } from 'express'
import service from '../services/service'
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import helperService from '../services/helperService'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '../utils/message'
import { Schedule, ServicePreview } from '@prisma/client'

/**
 * 1. Create service - Done
 * 2. Get service by id
 * 3. Update service
 * 4. Delete service
 * 5. Get all services based on category   - Completed
 * 6. Get service providers services
 * 7. Book service - Completed
 * 8. Cancelled booked service
 * 9. Updated booked service
 * 10. Upcoming events - Completed
 * 11. Past events
 **/
// Controller to create a service
export const createService = asyncHandler(
  async (
    req: Request<
      {},
      {},
      { id: string; isServiceProvider: boolean; serviceData: any }
    >,
    res: Response,
  ) => {
    const { id, isServiceProvider, serviceData } = req.body

    if (isServiceProvider) {
      throw new ApiError(403, ERROR_MESSAGE.notAuthorized)
    }

    const isValidUser = await helperService.verifyUser(id)
    if (!isValidUser) {
      throw new ApiError(400, ERROR_MESSAGE.userNotFound)
    }

    const response = await service.createService(
      serviceData,
      serviceData.servicePreview,
      serviceData.selectedDates,
    )

    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.serviceFailure)
    }

    return res
      .status(201)
      .json(new ApiResponse(201, response, SUCCESS_MESSAGE.serviceCreated))
  },
)

// Controller to get all the services created by a service provider
export const getMyService = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await service.getMyService(req.body.id)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, response, 'User services retrieved successfully'),
      )
  },
)

// Controller to get all services based on user preferences (Category)
export const getServicesByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    let categories: string[] = []
    if (req.query.category) {
      try {
        categories = JSON.parse(req.query.category as string)
        if (!Array.isArray(categories)) {
          throw new ApiError(400, ERROR_MESSAGE.invalidCategory)
        }
      } catch (error) {
        throw new ApiError(400, ERROR_MESSAGE.invalidCategory)
      }
    }

    const response = await service.getServicesByCategory(
      req.query.id as string | undefined,
      categories,
    )

    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }

    return res
      .status(200)
      .json(new ApiResponse(200, response, SUCCESS_MESSAGE.serviceRetreive))
  },
)

// Controller to book a service
export const bookService = asyncHandler(async (req: Request, res: Response) => {
  const { userId, schedule } = req.body

  const response = await service.bookService(userId, schedule)
  if (!response) {
    throw new ApiError(500, ERROR_MESSAGE.bookingFailure)
  }
  return res
    .status(200)
    .json(new ApiResponse(200, response, SUCCESS_MESSAGE.bookingSuccessFull))
})

// Controller to get upcoming events for a user
export const getUpcomingEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body
    const response = await service.getUpcomingEvents(userId)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }

    return res
      .status(200)
      .json(new ApiResponse(200, response, SUCCESS_MESSAGE.serviceRetreive))
  },
)
