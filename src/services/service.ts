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

const getServiceDetailsById = async (serviceId: string) => {
  const service = await prisma.services.findFirst({
    where: {
      id: serviceId,
      deletedAt: null,
      isDisabled: false,
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
        orderBy: {
          date: 'asc',
        },
      },
    },
  });

  if (!service) {
    return null;
  }

  // Shape the result to match the desired structure
  return {
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
  };
};

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
    // If not approved, make the slot available again and remove the booking
    baseUpdate.isAvailable = true
    baseUpdate.bookedUserId = null
  } else {
    // If approved, keep the slot unavailable (since it's booked)
    baseUpdate.isAvailable = false
  }

  console.log('handleSlotApproval - slotDetails:', slotDetails)
  console.log('handleSlotApproval - baseUpdate:', baseUpdate)

  return prisma.schedule.update({
    where: { id: slotDetails.scheduleId },
    data: baseUpdate,
  })
}

const getServiceProviderEvents = async (
  userId: string,
  isApproved: boolean | undefined,
  isUpcoming: boolean,
  date: Date,
) => {
  const now = new Date()
  now.setDate(now.getDate() - 1)
  now.setUTCHours(0, 0, 0, 0)

  const dateCondition = isUpcoming
    ? { gt: now } // Upcoming: date is after now
    : { lte: now } // Past: date is now or before

  console.log('getServiceProviderEvents - Service provider events:', {
    serviceProviderId: userId,
    isApproved: isApproved,
    date: dateCondition,
  })

  // Build the where condition
  const whereCondition: any = {
    services: {
      userId: userId, // Services owned by this service provider
      deletedAt: null,
      isDisabled: false,
    },
    bookedUserId: {
      not: null, // Only events that have been booked by someone
    },
    date: dateCondition,
  }

  // Only add isApproved filter if it's defined
  if (isApproved !== undefined) {
    whereCondition.isApproved = isApproved;
  }

  // Fetch all schedules for services owned by this service provider
  const serviceProviderSchedules = await prisma.schedule.findMany({
    where: whereCondition,
    include: {
      bookedUser: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
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
      date: 'asc',
    },
  })

  console.log('getServiceProviderEvents - Found schedules:', serviceProviderSchedules.length);
  return serviceProviderSchedules
}

const getMyBookedService = async ({
  id,
  type,
}: {
  id: string
  type: string
}) => {
  console.log('getMyBookedService - Received type:', type, 'for user:', id);
  
  if (type === 'Booked') {
    // For 'Booked' type, get events that need approval
    console.log('Getting events for approval...');
    return await getEventsForApproval(id)
  }
  
  // Convert to lowercase for comparison
  const typeLower = type.toLowerCase();
  const isUpcoming = typeLower === 'upcoming'
  const isApproved = typeLower === 'approved'

  console.log('getMyBookedService - isUpcoming:', isUpcoming, 'isApproved:', isApproved);

  // For service providers, get events for their services
  // For upcoming/past events, show all events (both approved and pending)
  // For approved events, show only approved events
  const shouldShowAllEvents = isUpcoming || typeLower === 'past';
  const finalIsApproved = shouldShowAllEvents ? undefined : isApproved;

  const response = await getServiceProviderEvents(id, finalIsApproved, isUpcoming, new Date())
  console.log('getMyBookedService - Response count:', response.length);
  return response
}

const getEventsForApproval = async (userId: string) => {
  // Get all events that need approval (events booked by other users for this service provider's services)
  const eventsForApproval = await prisma.schedule.findMany({
    where: {
      services: {
        userId: userId, // Services owned by this user
        deletedAt: null,
        isDisabled: false,
      },
      bookedUserId: {
        not: null, // Has been booked by someone
      },
      isApproved: false, // Not yet approved
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
      date: 'asc',
    },
  })

  return eventsForApproval
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
  getServiceDetailsById,
  holdSchedule,
  handleSlotApproval,
  getMyBookedService,
  getEventsForApproval,
  getUserScheduleDates,
  getUserScheduleDatesExcludingService,
  getServiceBookedSlots,
  getServiceScheduleDates,
  getServiceProviderEvents,
}
