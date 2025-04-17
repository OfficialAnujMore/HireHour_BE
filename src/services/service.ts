import prisma from '../prisma/client'
import {
  Service,
  UpsertServiceRequestBody,
} from '../interfaces/serviceInterface'

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
        }
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
  schedule: {
    id: string
    servicesId: string
    date: string
    selected: boolean
    isAvailable: boolean
  }[],
) => {
  const updatePromises = schedule.map((scheduleItem) =>
    prisma.schedule.update({
      where: { id: scheduleItem.id },
      data: {
        bookedUserId: userId,
        isAvailable: scheduleItem.isAvailable,
      },
    }),
  )

  const res = await Promise.all(updatePromises)

  return res
}

const getUpcomingEvents = async (userId: string) => {
  const bookedSchedules = await prisma.schedule.findMany({
    where: { bookedUserId: userId },
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
          schedule: {
            where: { bookedUserId: userId }, // Fetch only schedules booked by the user
          },
        },
      },
    },
  })

  // Use a map to group services by serviceId and merge schedules
  const uniqueServicesMap = new Map<string, any>()

  bookedSchedules.forEach((schedule) => {
    const service = schedule.services
    if (service) {
      const existingService = uniqueServicesMap.get(service.id)

      // If the service already exists in the map, merge the schedules
      if (existingService) {
        // Filter out duplicate schedules based on schedule.id
        const newSchedules = (service?.schedule || []).filter(
          (sched) =>
            !existingService.schedule.some(
              (existingSched: any) => existingSched.id === sched.id,
            ),
        )

        existingService.schedule = [
          ...existingService.schedule,
          ...newSchedules.map((sched) => ({
            id: sched.id,
            date: sched.date,
            selected: true, // Mark schedules as selected since they are booked
            servicesId: sched.servicesId,
          })),
        ]
      } else {
        // Otherwise, create a new entry for the service
        uniqueServicesMap.set(service.id, {
          userId: service?.user.id,
          name: `${service?.user.firstName} ${service?.user.lastName}`,
          email: service?.user.email,
          username: service?.user.username,
          phoneNumber: service?.user.phoneNumber,
          isServiceProvider: service?.user.isServiceProvider,
          avatarUri: service?.user.avatarUri || '',
          serviceId: service?.id,
          title: service?.title,
          description: service?.description,
          pricing: service?.pricing,
          ratings: service?.ratings,
          category: service?.category,
          deletedAt: service?.deletedAt,
          isDisabled: service?.isDisabled,
          createdAt: service?.createdAt,
          updatedAt: service?.updatedAt,
          servicePreview: service?.servicePreview.map((preview) => ({
            id: preview.id,
            uri: preview.uri,
            servicesId: preview.servicesId,
          })),
          schedule: (service?.schedule || []).map((sched) => ({
            id: sched.id,
            date: sched.date,
            selected: true, // Mark schedules as selected since they are booked
            servicesId: sched.servicesId,
          })),
        })
      }
    }
  })

  // Return the values of the map as the final result
  return Array.from(uniqueServicesMap.values())
}

const upsertService = async (
  serviceData: UpsertServiceRequestBody,
  serviceId?: string, // Optional for update
) => {

  if (serviceId) {
    // Update existing service: delete old records first
    await prisma.servicePreview.deleteMany({
      where: { servicesId: serviceId },
    })
    await prisma.schedule.deleteMany({
      where: { servicesId: serviceId },
    })
    console.log('Both service preview and schedule deletedß')
  }

  // Prepare service payload
  const servicePayload: any = {
    title: serviceData.title,
    description: serviceData.description,
    pricing: parseFloat(serviceData.pricing),
    userId: serviceData.userId,
    category: serviceData.category,
    servicePreview: serviceData.servicePreview?.length
      ? {
          create: serviceData.servicePreview.map((preview) => ({
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

export default {
  getMyService,
  getServicesByCategory,
  bookService,
  getUpcomingEvents,
  upsertService,
  deleteService,
  getServiceById,
}
