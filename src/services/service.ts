import { Role, ServicePreview, Services } from '@prisma/client'
import prisma from '../prisma/client'

const createService = async (
  userService: Services,
  servicePreviews?: ServicePreview[],
  schedules?: {
    day: string
    month: string
    date: string // Should remain as a string since it's separate from `fullDate`
    fullDate: Date
    timeSlots: {
      time: string
      available: boolean
    }[]
  }[],
) => {
  return await prisma.services.create({
    data: {
      title: userService.title,
      description: userService.description,
      chargesPerHour: userService.chargesPerHour,
      userId: userService.userId,
      category: userService.category,
      servicePreview: servicePreviews
        ? {
            create: servicePreviews.map((preview) => ({
              imageUri: preview.imageUri,
            })),
          }
        : undefined,
      schedule: schedules
        ? {
            create: schedules.map((schedule) => ({
              day: schedule.day,
              month: schedule.month,
              date: schedule.date,
              fullDate: schedule.fullDate,
              timeSlots: {
                create: schedule.timeSlots.map((timeSlot) => ({
                  time: timeSlot.time,
                  available: timeSlot.available,
                })),
              },
            })),
          }
        : undefined,
    },
  })
}

const getServiceById = async (serviceId: string) => {
  return await prisma.services.findUnique({
    where: { id: serviceId },
    include: {
      servicePreview: true,
      schedule: {
        include: {
          timeSlots: true,
        },
      },
    },
  })
}

const updateService = async (
  serviceId: string,
  updateData: Partial<Services>,
  servicePreviews?: ServicePreview[],
  schedules?: {
    id: string
    day: string
    month: string
    date: string
    fullDate: Date
    timeSlots: {
      id: string
      time: string
      available: boolean
    }[]
  }[],
) => {
  return await prisma.services.update({
    where: { id: serviceId },
    data: {
      ...updateData,
      servicePreview: servicePreviews
        ? {
            upsert: servicePreviews.map((preview) => ({
              where: { id: preview.id || '' },
              update: { imageUri: preview.imageUri },
              create: { imageUri: preview.imageUri },
            })),
          }
        : undefined,
      schedule: schedules
        ? {
            upsert: schedules.map((schedule) => ({
              where: { id: schedule.id || '' },
              update: {
                day: schedule.day,
                month: schedule.month,
                date: schedule.date,
                fullDate: schedule.fullDate,
                timeSlots: {
                  upsert: schedule.timeSlots.map((timeSlot) => ({
                    where: { id: timeSlot.id || '' },
                    update: {
                      time: timeSlot.time,
                      available: timeSlot.available,
                    },
                    create: {
                      time: timeSlot.time,
                      available: timeSlot.available,
                    },
                  })),
                },
              },
              create: {
                day: schedule.day,
                month: schedule.month,
                date: schedule.date,
                fullDate: schedule.fullDate,
                timeSlots: {
                  create: schedule.timeSlots.map((timeSlot) => ({
                    time: timeSlot.time,
                    available: timeSlot.available,
                  })),
                },
              },
            })),
          }
        : undefined,
    },
  })
}

const deleteService = async (servicesId: string) => {
  // Delete all dependencies and then the service itself
  // await prisma.$transaction([
  //   prisma.timeSlot.deleteMany({
  //     where: {
  //       schedule: {
  //         servicesId,
  //       },
  //     },
  //   }),
  //   prisma.schedule.deleteMany({
  //     where: {
  //       servicesId,
  //     },
  //   }),
  //   prisma.servicePreview.deleteMany({
  //     where: {
  //       servicesId,
  //     },
  //   }),
  //   prisma.services.delete({
  //     where: {
  //       id: servicesId,
  //     },
  //   }),
  // ])

  return await prisma.services.update({
    where: { id: servicesId },
    data: {
      deletedAt: new Date(),
    },
  })
}

const getMyService = async (id?: string) => {
  const services = await prisma.user.findMany({
    where: {
      AND: [
        { isCustomer: false },
        { deletedAt: null },
        { isDisabled: false },
        ...(id ? [{ id }] : []),
      ],
    },
    select: {
      Services: {
        where: {
          AND: [{ deletedAt: null }, { isDisabled: false }],
        },
        include: {
          servicePreview: true,
          schedule: {
            include: {
              timeSlots: true,
            },
          },
        },
      },
    },
  })
  return services.flatMap((user) => user.Services)
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
          isCustomer: true,
          avatarUri: true,
        },
      },
      servicePreview: true,
      schedule: {
        include: {
          timeSlots: true,
        },
      },
    },
  })

  // Shape the result to match the desired structure
  return services.map((service) => ({
    userId: service.user.id,
    name: `${service.user.firstName} ${service.user.lastName}`,
    email: service.user.email,
    username: service.user.username,
    phoneNumber: service.user.phoneNumber,
    isCustomer: service.user.isCustomer,
    avatarUri: service.user.avatarUri || '',
    serviceId: service.id,
    title: service.title,
    description: service.description,
    chargesPerHour: service.chargesPerHour,
    ratings: service.ratings,
    category: service.category,
    deletedAt: service.deletedAt,
    isDisabled: service.isDisabled,
    createdAt: service.createdAt,
    updatedAt: service.updatedAt,
    servicePreview: service.servicePreview.map((preview) => ({
      id: preview.id,
      imageUri: preview.imageUri,
      servicesId: preview.servicesId,
    })),
    schedule: service.schedule.map((sched) => ({
      id: sched.id,
      day: sched.day,
      month: sched.month,
      date: sched.date,
      fullDate: sched.fullDate,
      servicesId: sched.servicesId,
      timeSlots: sched.timeSlots.map((slot) => ({
        id: slot.id,
        time: slot.time,
        available: slot.available,
      })),
    })),
  }))
}

const bookService = async (userId: string, timeSlotId: string) => {

  return await prisma.timeSlot.update({
    where: { id: timeSlotId },
    data: {
      bookedUserId: userId,
      available: false,
    },
  })
}

const getUpcomingEvents = async (userId: string) => {
  const upcomingEvents = await prisma.timeSlot.findMany({
    where: { bookedUserId: userId },
    include: {
      schedule: {
        include: {
          Services: true,
        },
      },
    },
  })

  // Format the response data
  const formattedEvents = upcomingEvents.map((event) => ({
    id: event.id,
    time: event.time,
    available: event.available,
    bookedUserId: event.bookedUserId,
    scheduleId: event.scheduleId,
    day: event.schedule.day,
    month: event.schedule.month,
    fullDate: event.schedule.fullDate,
    date: event.schedule.date,
    title: event.schedule.Services?.title || null,
    description: event.schedule.Services?.description || null,
    deletedAt: event.schedule.Services?.deletedAt || null,
    isDisabled: event.schedule.Services?.isDisabled || null,
    createdAt: event.schedule.Services?.createdAt || null,
    updatedAt: event.schedule.Services?.updatedAt || null,
  }))

  return formattedEvents
}

export default {
  createService,
  getServiceById,
  updateService,
  getMyService,
  deleteService,
  getServicesByCategory,
  bookService,
  getUpcomingEvents,
}
