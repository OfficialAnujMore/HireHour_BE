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
  BookServiceRequestBody,
  SlotApprovalRequestBody,
  HoldSlotRequestBody,
  GetUserServicesRequest,
  GetBookedServicesRequest,
  DeleteServiceRequest,
  UpcomingEventsRequest,
} from '../interfaces/serviceInterface'
import { FCM_MESSAGE } from '../utils/fcmMessage'
import { formatDateUS, initializePushNotification } from '../utils/helperFunctions'

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

  const transactionResponse = await transaction.storeTransaction({
    userId,
    cartItems,
    paymentDetails,
  })

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
  async (req: Request<{}, {}, UpcomingEventsRequest>, res: Response) => {
    const { userId, type, limit, offset } = req.body
    
    if (!userId) {
      throw new ApiError(400, 'User ID is required')
    }

    console.log('getUpcomingEvents controller - userId:', userId, 'type:', type);

    const response = await service.getAllScheduledEvents(
      userId,
      true, // isApproved - for upcoming events, we want approved events
      type === 'upcoming', // isUpcoming - true for upcoming, false for past
      new Date(),
    )
    
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }

    console.log('getUpcomingEvents controller - Response count:', response.length);

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
    const { serviceId, fcmToken } = req.query

    if (!serviceId || typeof serviceId !== 'string') {
      throw new ApiError(400, 'Service ID is required')
    }

    const verifyExistingService =
      await helperService.verifyExistingService(serviceId)
    if (!verifyExistingService) {
      throw new ApiError(404, ERROR_MESSAGE.serviceNotFound)
    }

    await service.deleteService(serviceId)
    if (fcmToken && typeof fcmToken === 'string') {
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
  async (req: Request<{}, {}, GetUserServicesRequest>, res: Response) => {
    const { userId, type } = req.body
    
    if (!userId) {
      throw new ApiError(400, 'User ID is required')
    }

    const response = await service.getMyService(userId)
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

// Controller to get user's existing schedule dates
export const getUserScheduleDates = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.query
    
    if (!userId || typeof userId !== 'string') {
      throw new ApiError(400, 'User ID is required')
    }

    const response = await service.getUserScheduleDates(userId)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, response, 'User schedule dates retrieved successfully'),
      )
  },
)

export const getUserScheduleDatesExcludingService = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId, serviceId } = req.query
    if (!userId || typeof userId !== 'string') {
      throw new ApiError(400, 'User ID is required')
    }
    if (!serviceId || typeof serviceId !== 'string') {
      throw new ApiError(400, 'Service ID is required')
    }
    const response = await service.getUserScheduleDatesExcludingService(userId, serviceId)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, response, 'User schedule dates (excluding service) retrieved successfully'),
      )
  },
)

// Controller to get booked slots for a specific service
export const getServiceBookedSlots = asyncHandler(
  async (req: Request, res: Response) => {
    const { serviceId } = req.query
    
    if (!serviceId || typeof serviceId !== 'string') {
      throw new ApiError(400, 'Service ID is required')
    }

    const response = await service.getServiceBookedSlots(serviceId)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, response, 'Service booked slots retrieved successfully'),
      )
  },
)

export const getServiceScheduleDates = asyncHandler(
  async (req: Request, res: Response) => {
    const { serviceId } = req.query
    if (!serviceId || typeof serviceId !== 'string') {
      throw new ApiError(400, 'Service ID is required')
    }
    const response = await service.getServiceScheduleDates(serviceId)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    return res
      .status(200)
      .json(
        new ApiResponse(200, response, 'Service schedule dates retrieved successfully'),
      )
  },
)

// Controller to hold a schedule for
export const holdSchedule = asyncHandler(
  async (req: Request<{}, {}, HoldSlotRequestBody>, res: Response) => {
    const { schedule } = req.body
    
    if (!schedule || !schedule.serviceId || !schedule.date || !schedule.userId) {
      throw new ApiError(400, 'Invalid schedule data')
    }

    // Transform schedule to match expected interface
    const scheduleArray = [{
      id: schedule.serviceId, // Using serviceId as id since we don't have a separate id
      servicesId: schedule.serviceId,
      date: schedule.date,
      selected: true,
      isAvailable: true
    }]

    const holdVerification =
      await helperService.verifyScheduleAvailability(scheduleArray)

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
    const response = await service.holdSchedule(scheduleArray)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.bookingFailure)
    }

    return res
      .status(200)
      .json(new ApiResponse(200, response, SUCCESS_MESSAGE.bookingSuccessFull))
  },
)

export const handleSlotApproval = asyncHandler(
  async (req: Request<{}, {}, SlotApprovalRequestBody>, res: Response) => {
    const { serviceId, scheduleId, isApproved, userId } = req.body
    
    if (!serviceId || !scheduleId || !userId) {
      throw new ApiError(400, 'Service ID, Schedule ID, and User ID are required')
    }

    const response = await service.handleSlotApproval(req.body)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInSlotApproval)
    }

    // Get user details for notification
    const userDetails = await helperService.verifyExistingUser(userId)
    if (userDetails?.fcmToken) {
      const body = {
        token: userDetails.fcmToken,
        title: `Slot request ${isApproved ? 'Approved' : 'Rejected'}`,
        body: `Your slot request has been ${isApproved ? 'approved' : 'rejected'}`,
      }
      initializePushNotification(body)
    }

    return res.status(200).json(new ApiResponse(200, response, 'Slot approval processed'))
  },
)

// Controller to get all the services created by a service provider
export const getMyBookedService = asyncHandler(
  async (req: Request<{}, {}, GetBookedServicesRequest>, res: Response) => {
    const { id, type } = req.body

    if (!id || !type) {
      throw new ApiError(400, 'User ID and type are required')
    }

    const response = await service.getMyBookedService({
      id,
      type,
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

// Controller to get service details by ID
export const getServiceDetailsById = asyncHandler(
  async (req: Request, res: Response) => {
    const { serviceId } = req.params;

    if (!serviceId || typeof serviceId !== 'string') {
      throw new ApiError(400, 'Service ID is required');
    }

    const serviceDetails = await service.getServiceDetailsById(serviceId);
    
    if (!serviceDetails) {
      throw new ApiError(404, ERROR_MESSAGE.serviceNotFound);
    }

    return res
      .status(200)
      .json(new ApiResponse(200, serviceDetails, SUCCESS_MESSAGE.serviceRetreive));
  },
);
