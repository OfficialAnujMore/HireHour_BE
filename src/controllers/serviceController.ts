import { Request, Response } from 'express'
import service from '../services/service'
import transaction from '../services/transactionService'

import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import helperService from '../services/helperService'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '../utils/message'
import {
  Service,
  UpsertServiceRequestBody,
} from '../interfaces/serviceInterface'
import { FCM_MESSAGE } from '../utils/fcmMessage'
import { initializePushNotification } from '../utils/helperFunctions'

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
  const { userId, cartItems, paymentDetails } = req.body
  const response = await service.bookService(userId, cartItems)

  if (!response) {
    throw new ApiError(500, ERROR_MESSAGE.bookingFailure)
  }

  const transactionResponse = await transaction.storeTransaction(
    userId,
    cartItems,
    paymentDetails,
  )

  if (!transactionResponse) {
    throw new ApiError(500, ERROR_MESSAGE.bookingFailure)
  }
  const fcmResponse = await helperService.getUserFCMToken(userId)

  if (fcmResponse?.fcmToken) {
    const body = {
      token: fcmResponse.fcmToken,
      title: FCM_MESSAGE.slotBooked.title,
      body: FCM_MESSAGE.slotBooked.body,
    }
    initializePushNotification(body)
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        transactionResponse,
        SUCCESS_MESSAGE.bookingSuccessFull,
      ),
    )
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

    if (serviceData.userId) {
      const fcmResponse = await helperService.getUserFCMToken(
        serviceData.userId,
      )

      if (fcmResponse?.fcmToken) {
        const body = {
          token: fcmResponse.fcmToken,
          title: FCM_MESSAGE.slotCreated.body,
          body: message,
        }
        initializePushNotification(body)
      }
    }

    return res
      .status(serviceId ? 200 : 201)
      .json(new ApiResponse(serviceId ? 200 : 201, response, message))
  },
)

export const deleteService = asyncHandler(
  async (req: Request, res: Response) => {
    const serviceId = req.query.serviceId as string | undefined
    const fcmToken = req.query.fcmToken as string | undefined

    if (!serviceId) {
      return res.status(400).json(new ApiError(400, 'Service ID is required'))
    }

    const verifyExistingService =
      await helperService.verifyExistingService(serviceId)
    if (!verifyExistingService) {
      return res
        .status(404)
        .json(new ApiError(404, ERROR_MESSAGE.serviceNotFound))
    }

    await service.deleteService(serviceId)
    if (fcmToken) {
      const body = {
        token: fcmToken,
        title: FCM_MESSAGE.slotDeletion.title,
        body: FCM_MESSAGE.slotDeletion.body,
      }
      initializePushNotification(body)
    }

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

// Controller to hold a schedule for
export const holdSchedule = asyncHandler(
  async (req: Request, res: Response) => {
    const { schedule } = req.body
    const holdVerification =
      await helperService.verifyScheduleAvailability(schedule)

    if (holdVerification.length > 0) {
      return res
        .status(409)
        .json(
          new ApiResponse(
            409,
            holdVerification,
            'Some slots are already been reserved',
          ),
        )
    }
    const response = await service.holdSchedule(schedule)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.bookingFailure)
    }

    return res
      .status(200)
      .json(new ApiResponse(200, response, SUCCESS_MESSAGE.bookingSuccessFull))
  },
)

export const handleSlotApproval = asyncHandler(
  async (req: Request, res: Response) => {
    const { date, isApproved, bookedUser, services } = req.body
    const { firstName, lastName } = services.user
    const response = await service.handleSlotApproval(req.body)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInSlotApproval)
    }

    const fcmResponse = await helperService.getUserFCMToken(bookedUser.id)
    if (fcmResponse?.fcmToken) {
      const body = {
        token: fcmResponse.fcmToken,
        title: `Slot request ${isApproved ? 'Approved' : 'Rejected'} for ${date}`,
        body: `${isApproved ? 'Approved' : 'Rejected'}  by ${firstName} ${lastName}`,
      }
      initializePushNotification(body)
    }

    return res.status(200).json(new ApiResponse(200, response, 'Slot approved'))
  },
)

// Controller to get all the services created by a service provider
export const getMyBookedService = asyncHandler(
  async (req: Request, res: Response) => {
    const { id, isAvailable } = req.body
    const response = await service.getMyBookedService({
      id: id,
      isAvailable: isAvailable,
    })
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response,
          'User booked services retrieved successfully',
        ),
      )
  },
)
