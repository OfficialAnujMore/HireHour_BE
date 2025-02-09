import { Request, Response } from 'express'
import service from '../services/service'
import { ApiError } from '../utils/ApiError'
import { ApiReponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import helperService from '../services/helperService'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '../utils/message'
import { Schedule, ServicePreview } from '@prisma/client'

/**
 * 1. Create service - Done
 * 2. Get service by id
 * 3. Update service
 * 4. Delete service
 * 5. Get all services based on category
 * 6. Get service providers services
 * 7. Book service
 * 8. Cancelled booked service
 * 9. Updated booked service
 * 10. Upcoming events
 * 11. Past events
 **/

// Controller to add a service
export const createService = asyncHandler(
  async (
    req: Request<
      {},
      {},
      { id: string; isServiceProvider: boolean; serviceData: any }
    >,
    res: Response,
  ) => {
    try {
      const { id, isServiceProvider, serviceData } = req.body

      // Ensure the user is a service provider
      if (isServiceProvider) {
        return res
          .status(403)
          .json(new ApiError(403, ERROR_MESSAGE.notAuthorized))
      }

      // Verify if the user is valid
      const isValidUser = await helperService.verifyUser(id)
      if (!isValidUser) {
        return res
          .status(400)
          .json(new ApiError(400, ERROR_MESSAGE.userNotFound))
      }

      console.log('Create service data', serviceData)

      // Create the service
      const response = await service.createService(
        serviceData,
        serviceData.servicePreview,
        serviceData.selectedDates,
      )
      return res
        .status(201)
        .json(new ApiReponse(201, {}, SUCCESS_MESSAGE.serviceCreated))
    } catch (err: any) {
      console.log(err)
      return res
        .status(500)
        .json(new ApiError(500, ERROR_MESSAGE.generalError, err))
    }
  },
)

// // Controller to soft-delete a service by ID
// export const deleteService = asyncHandler(
//   async (req: Request, res: Response) => {
//     try {
//       const { servicesId } = req.body

//       // Validate the servicesId
//       if (!servicesId) {
//         return res
//           .status(400)
//           .json(new ApiError(400, ERROR_MESSAGE.serviceNotFound))
//       }

//       const response = await service.deleteService(servicesId)

//       return res
//         .status(200)
//         .json(new ApiReponse(200, response, SUCCESS_MESSAGE.deletedSuccessFully))
//     } catch (err: any) {
//       return res
//         .status(500)
//         .json(new ApiError(500, ERROR_MESSAGE.generalError, err))
//     }
//   },
// )

// // Controller to update service
// export const updateService = asyncHandler(
//   async (
//     req: Request<
//       {},
//       {},
//       {
//         id: string
//         isServiceProvider: boolean
//         serviceId: string
//         servicePreviews: ServicePreview[]
//         schedules: Schedule
//         serviceData: any
//       }
//     >,
//     res: Response,
//   ) => {
//     try {
//       const {
//         id,
//         isServiceProvider,
//         serviceId,
//         servicePreviews,
//         schedules,
//         serviceData,
//       } = req.body

//       // Ensure the user is a service provider
//       if (isServiceProvider) {
//         return res
//           .status(403)
//           .json(new ApiError(403, ERROR_MESSAGE.notAuthorized))
//       }

//       // Verify if the user is valid
//       const isValidUser = await helperService.verifyUser(id)
//       if (!isValidUser) {
//         return res
//           .status(400)
//           .json(new ApiError(400, ERROR_MESSAGE.userNotFound))
//       }

//       // Create the service
//       const response = await service.updateService(
//         serviceData,
//         serviceData.servicePreview,
//         serviceData.schedule,
//       )
//       return res
//         .status(201)
//         .json(new ApiReponse(201, response, SUCCESS_MESSAGE.serviceCreated))
//     } catch (err: any) {
//       console.log(err)

//       return res
//         .status(500)
//         .json(new ApiError(500, ERROR_MESSAGE.generalError, err))
//     }
//   },
// )

// // Controller to get service details by service id
// export const getServiceById = asyncHandler(
//   async (
//     req: Request<{}, {}, { id: string; isServiceProvider: boolean; serviceData: any }>,
//     res: Response,
//   ) => {
//     try {
//       const { id } = req.body
//       const response = await service.getServiceById(id)
//       return res
//         .status(201)
//         .json(new ApiReponse(201, response, SUCCESS_MESSAGE.success))
//     } catch (err: any) {
//       return res
//         .status(500)
//         .json(new ApiError(500, ERROR_MESSAGE.generalError, err))
//     }
//   },
// )

// // Controller to get all the services created by an service provider
export const getMyService = asyncHandler(
  async (req: Request, res: Response) => {
    console.log(req.body.id)

    const response = await service.getMyService(req.body.id)
    return res
      .status(200)
      .json(
        new ApiReponse(200, response, 'User services retrieved successfully'),
      )
  },
)

// Controller to get all services based on user preferences (Category)
export const getServicesByCategory = asyncHandler(
  async (req: Request, res: Response) => {
    console.log()

    let categories: string[] = []
    if (req.query.category) {
      try {
        categories = JSON.parse(req.query.category as string)
        if (!Array.isArray(categories)) {
          return res
            .status(400)
            .json(new ApiError(400, 'Invalid category format'))
        }
      } catch (error) {
        return res
          .status(400)
          .json(new ApiError(400, 'Invalid JSON format for category'))
      }
    }

    const response = await service.getServicesByCategory(
      req.query.id as string | undefined,
      categories,
    )
    console.log(response)

    return res
      .status(200)
      .json(
        new ApiReponse(
          200,
          response,
          'Service providers retrieved successfully',
        ),
      )
  },
)

// // Controller to book a service
export const bookService = asyncHandler(async (req: Request, res: Response) => {
  try {
    const { userId, schedule } = req.body
    console.log('bookService BE Controller', { userId, schedule })
    const response = await service.bookService(userId, schedule)
    console.log({ response })

    return res
      .status(200)
      .json(new ApiReponse(200, response, 'Slot booked successfully'))
  } catch (err: any) {
    return res
      .status(500)
      .json(new ApiError(500, ERROR_MESSAGE.generalError, err))
  }
})

// // Controller to get upcoming events for a user
export const getUpcomingEvents = asyncHandler(
  async (req: Request, res: Response) => {
    const { userId } = req.body
    const response = await service.getUpcomingEvents(userId)
    console.log('Controller to get upcoming events for a user', response)

    return res
      .status(200)
      .json(new ApiReponse(200, response, 'Service fetched  successfully'))
  },
)
