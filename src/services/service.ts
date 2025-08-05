import prisma from '../prisma/client'
import { UpsertServiceRequestBody } from '../interfaces/serviceInterface'
import { uploadMultipleImagesToCloudinary, deleteMultipleImagesFromCloudinary } from '../utils/cloudinaryService'
import { base64ToBuffer, isValidBase64Image, isRemoteUrl } from '../utils/imageUtils'

const getMyService = async (id?: string) => {
  const services = await prisma.services.findMany({
    where: {
      deletedAt: null,
      isDisabled: false,
      userId: id,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          phoneNumber: true,
          isServiceProvider: true,
          avatarUri: true,
        },
      },
      servicePreview: true,
      schedule: true,
    },
  })

  return services.map((service) => ({
    userId: service.user.id,
    name: `${service.user.firstName} ${service.user.lastName}`,
    email: service.user.email,
    username: service.user.username,
    phoneNumber: service.user.phoneNumber,
    isServiceProvider: service.user.isServiceProvider,
    avatarUri: service.user.avatarUri || '',
    serviceId: service.id,
    title: service.title,
    description: service.description,
    pricing: service.pricing,
    ratings: service.ratings,
    category: service.category,
    deletedAt: service.deletedAt,
    isDisabled: service.isDisabled,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    servicePreview: service.servicePreview.map((preview) => ({
      id: preview.id,
      uri: preview.uri,
      servicesId: preview.servicesId,
    })),
    schedule: service.schedule.map((sched) => ({
      id: sched.id,
      date: sched.date,
      selected: sched.isAvailable,
      servicesId: sched.servicesId,
    })),
  }))
}

const getServicesByCategory = async (
  userId: string | undefined,
  categories: string[],
) => {
  const services = await prisma.services.findMany({
    where: {
      deletedAt: null,
      isDisabled: false,
      category: {
        in: categories,
      },
      userId: {
        not: userId,
      },
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          username: true,
          phoneNumber: true,
          isServiceProvider: true,
          avatarUri: true,
        },
      },
      servicePreview: true,
      schedule: {
        where: {
          isAvailable: true,
          holdExpiresAt: null,
        },
      }, // Fetching schedule directly since timeSlots are removed
    },
  })

  // Shape the result to match the desired structure
  return services.map((service) => ({
    userId: service.user.id,
    name: `${service.user.firstName} ${service.user.lastName}`,
    email: service.user.email,
    username: service.user.username,
    phoneNumber: service.user.phoneNumber,
    isServiceProvider: service.user.isServiceProvider,
    avatarUri: service.user.avatarUri || '',
    serviceId: service.id,
    title: service.title,
    description: service.description,
    pricing: service.pricing,
    ratings: service.ratings,
    category: service.category,
    deletedAt: service.deletedAt,
    isDisabled: service.isDisabled,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    servicePreview: service.servicePreview.map((preview) => ({
      id: preview.id,
      uri: preview.uri,
      servicesId: preview.servicesId,
    })),
    schedule: service.schedule.map((sched) => ({
      id: sched.id,
      date: sched.date,
      selected: sched.isAvailable,
      servicesId: sched.servicesId,
    })),
  }))
}

const bookService = async (
  userId: string,
  cartItems: {
    schedule: {
      id: string
      servicesId: string
      date: string
      selected: boolean
    }[]
  }[],
) => {
  const updatePromises: any[] = []

  cartItems.forEach((cartItem) => {
    cartItem.schedule.forEach((scheduleItem) => {
      updatePromises.push(
        prisma.schedule.update({
          where: { id: scheduleItem.id },
          data: {
            bookedUserId: userId,
            isAvailable: false,
            holdExpiresAt: null,
            // venue: cartItem.venue,
            // url: cartItem.meetingUrl,
            // address: cartItem.addressInfo.address,
            // city: cartItem.addressInfo.city,
            // postalCode: cartItem.addressInfo.postalCode,
            // state: cartItem.addressInfo.state,
            // country: cartItem.addressInfo.country,
          },
        }),
      )
    })
  })

  const res = await Promise.all(updatePromises)

  return res
}

const getAllScheduledEvents = async (
  userId: string,
  isApproved: boolean,
  isUpcoming: boolean,
  date: Date,
) => {
  // const now = new Date()
  const now = new Date()
  now.setDate(now.getDate() - 1)
  now.setUTCHours(0, 0, 0, 0) // Set the time to 00:00:00.000
  // const formattedTime = now.toISOString() // This will give you the date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)

  const dateCondition = isUpcoming
    ? { gt: now } // Upcoming: date is after now
    : { lte: now } // Past: date is now or before
  console.log({
    bookedUserId: userId,
    isApproved: isApproved,
    date: dateCondition,
  })

  // Fetch all schedules booked by the user
  const allSchedules = await prisma.schedule.findMany({
    where: {
      bookedUserId: userId,
      isApproved: isApproved,
      date: dateCondition,
    },
    include: {
      services: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              username: true,
              phoneNumber: true,
              isServiceProvider: true,
              avatarUri: true,
            },
          },
          servicePreview: true,
        },
      },
    },

    orderBy: {
      date: 'asc', // Assuming "date" field is used to schedule
    },
  })

  return allSchedules
}

const upsertService = async (
  serviceData: UpsertServiceRequestBody,
  serviceId?: string, // Optional for update
) => {
  // Handle image uploads if servicePreview exists
  let processedServicePreview = serviceData.servicePreview

  if (serviceData.servicePreview?.length) {
    const imagesToUpload: Buffer[] = []
    const processedImages: { uri: string }[] = []

    for (const preview of serviceData.servicePreview) {
      // If it's already a remote URL (Cloudinary), keep it as is
      if (isRemoteUrl(preview.uri)) {
        processedImages.push({ uri: preview.uri })
        continue
      }

      // If it's a base64 image, convert to buffer for upload
      if (preview.isBase64 || isValidBase64Image(preview.uri)) {
        try {
          const imageBuffer = base64ToBuffer(preview.uri)
          imagesToUpload.push(imageBuffer)
        } catch (error) {
          console.error('Error converting base64 to buffer:', error)
          throw new Error('Invalid image format')
        }
      } else {
        // For local file URIs, we'll need to handle them differently
        // For now, we'll skip them and log a warning
        console.warn('Local file URI detected, skipping:', preview.uri)
        continue
      }
    }

    // Upload images to Cloudinary if there are any to upload
    if (imagesToUpload.length > 0) {
      try {
        const uploadResults = await uploadMultipleImagesToCloudinary(
          imagesToUpload,
          `hirehour-services/user-${serviceData.userId}`
        )

        // Add uploaded image URLs to processed images
        uploadResults.forEach((result) => {
          processedImages.push({ uri: result.secure_url })
        })
      } catch (error) {
        console.error('Error uploading images to Cloudinary:', error)
        throw new Error('Failed to upload images')
      }
    }

    processedServicePreview = processedImages
  }

  if (serviceId) {
    // Update existing service: delete old records first
    await prisma.servicePreview.deleteMany({
      where: { servicesId: serviceId },
    })
    await prisma.schedule.deleteMany({
      where: { servicesId: serviceId },
    })
  }

  // Prepare service payload
  const servicePayload: any = {
    title: serviceData.title,
    description: serviceData.description,
    pricing: parseFloat(serviceData.pricing),
    userId: serviceData.userId,
    category: serviceData.category,
    servicePreview: processedServicePreview?.length
      ? {
          create: processedServicePreview.map((preview) => ({
            uri: preview.uri,
          })),
        }
      : undefined,
    schedule:
      serviceData.selectedDates && Object.keys(serviceData.selectedDates).length
        ? {
            create: Object.entries(serviceData.selectedDates)
              .filter(([_, { isAvailable }]) => isAvailable) // Only include dates with isAvailable true
              .map(([date, { isAvailable }]) => ({
                date,
                isAvailable,
              })),
          }
        : undefined,
  }

  if (serviceId) {
    return await prisma.services.update({
      where: { id: serviceId },
      data: servicePayload,
      include: {
        servicePreview: true,
        schedule: true,
      },
    })
  } else {
    return await prisma.services.create({
      data: servicePayload,
      include: {
        servicePreview: true,
        schedule: true,
      },
    })
  }
}

const deleteService = async (
  serviceId: string, // Required to delete the service
) => {
  // Soft delete the service by updating the 'deletedAt' field
  await prisma.services.update({
    where: { id: serviceId },
    data: {
      deletedAt: new Date(), // Mark service as deleted by setting 'deletedAt'
    },
  })

  // Permanently delete the related servicePreview
  await prisma.servicePreview.deleteMany({
    where: { servicesId: serviceId }, // Correct field to reference the serviceId
  })

  // Permanently delete the related schedule
  await prisma.schedule.deleteMany({
    where: { servicesId: serviceId }, // Correct field to reference the serviceId
  })
}

const getServiceById = async (id: string) => {
  return await prisma.services.findFirst({
    where: {
      AND: [{ id: id }],
    },
  })
}

const holdSchedule = async (
  schedule: {
    id: string
    servicesId: string
    date: string
    selected: boolean
    isAvailable: boolean
  }[],
) => {
  const holdDurationInMinutes = 15
  const holdUntilTime = new Date(Date.now() + holdDurationInMinutes * 60 * 1000)

  const updatePromises = schedule.map((scheduleItem) =>
    prisma.schedule.update({
      where: { id: scheduleItem.id },
      data: {
        isAvailable: false,
        holdExpiresAt: holdUntilTime,
      },
    }),
  )
  return await Promise.all(updatePromises)
}

const handleSlotApproval = async (slotDetails: any) => {
  const baseUpdate: any = {
    isApproved: slotDetails.isApproved,
  }

  if (!slotDetails.isApproved) {
    baseUpdate.isAvailable = true
    baseUpdate.bookedUserId = null
  } else {
    baseUpdate.isAvailable = slotDetails.isAvailable
    baseUpdate.isApproved = slotDetails.isApproved
  }

  console.log(slotDetails)

  return prisma.schedule.update({
    where: { id: slotDetails.id },
    data: baseUpdate,
  })
}

const getMyBookedService = async ({
  id,
  type,
}: {
  id: string
  type: string
}) => {
  const isUpcoming = type === 'upcoming'
  const isApproved = type === 'approved'

  const response = await getAllScheduledEvents(id, isApproved, isUpcoming, new Date())
  return response
}

const getUserScheduleDates = async (userId: string) => {
  // Get all schedule dates for the user's services
  const userSchedules = await prisma.schedule.findMany({
    where: {
      services: {
        userId: userId,
        deletedAt: null,
        isDisabled: false,
      },
    },
    select: {
      date: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  // Extract unique dates and format them
  const uniqueDates = [...new Set(userSchedules.map(schedule => 
    schedule.date.toISOString().split('T')[0] // Format as YYYY-MM-DD
  ))]

  return uniqueDates
}

const getUserScheduleDatesExcludingService = async (userId: string, serviceId: string) => {
  // Get all schedule dates for the user's services EXCEPT the current service being edited
  const userSchedules = await prisma.schedule.findMany({
    where: {
      services: {
        userId: userId,
        deletedAt: null,
        isDisabled: false,
        id: {
          not: serviceId, // Exclude the current service
        },
      },
    },
    select: {
      date: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  // Extract unique dates and format them
  const uniqueDates = [...new Set(userSchedules.map(schedule => 
    schedule.date.toISOString().split('T')[0] // Format as YYYY-MM-DD
  ))]

  return uniqueDates
}

const getServiceBookedSlots = async (serviceId: string) => {
  // Get all booked slots for a specific service
  const bookedSlots = await prisma.schedule.findMany({
    where: {
      servicesId: serviceId,
      bookedUserId: {
        not: null, // Only get slots that have been booked
      },
      isAvailable: false, // Only get slots that are not available
    },
    include: {
      bookedUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      date: 'asc',
    },
  })

  return bookedSlots
}

const getServiceScheduleDates = async (serviceId: string) => {
  // Get all schedule dates for a specific service (both available and booked)
  const serviceSchedules = await prisma.schedule.findMany({
    where: {
      servicesId: serviceId,
    },
    select: {
      id: true,
      date: true,
      isAvailable: true,
      bookedUserId: true,
    },
    orderBy: {
      date: 'asc',
    },
  })

  return serviceSchedules
}

export default {
  getMyService,
  getServicesByCategory,
  bookService,
  getAllScheduledEvents,
  upsertService,
  deleteService,
  getServiceById,
  holdSchedule,
  handleSlotApproval,
  getMyBookedService,
  getUserScheduleDates,
  getUserScheduleDatesExcludingService,
  getServiceBookedSlots,
  getServiceScheduleDates,
}
