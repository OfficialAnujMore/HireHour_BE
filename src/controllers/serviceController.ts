import { Request, Response } from 'express'
import service from '../services/service'
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import helperService from '../services/helperService'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '../utils/message'
import { Schedule, ServicePreview } from '@prisma/client'
import {
  Service,
  UpsertServiceRequestBody,
} from '../interfaces/serviceInterface'

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

export const upsertService = asyncHandler(
  async (req: Request<{}, {}, UpsertServiceRequestBody>, res: Response) => {
    const serviceData = req.body

    if (!serviceData) {
      throw new ApiError(400, ERROR_MESSAGE.invalidData)
    }

    const serviceId = serviceData?.id || undefined

    const response = await service.upsertService(serviceData, serviceId)

    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.serviceFailure)
    }

    const message = serviceId
      ? SUCCESS_MESSAGE.serviceUpdated
      : SUCCESS_MESSAGE.serviceCreated

    return res
      .status(serviceId ? 200 : 201)
      .json(new ApiResponse(serviceId ? 200 : 201, response, message))
  },
)

export const deleteService = asyncHandler(
  async (req: Request<{}, {}, { serviceId: string }>, res: Response) => {
    const { serviceId } = req.body
    console.log(serviceId)

    const existingService = await helperService.existingService(serviceId)
    if (!existingService) {
      return res
        .status(404)
        .json(new ApiError(404, ERROR_MESSAGE.serviceNotFound))
    }
    const response = await service.deleteService(serviceId)

    return res
      .status(200)
      .json(new ApiResponse(200, null, SUCCESS_MESSAGE.serviceDeleted))
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
