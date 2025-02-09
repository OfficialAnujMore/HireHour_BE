import { Role, ServicePreview, Services } from '@prisma/client'
import prisma from '../prisma/client'

const createService = async (
  userService: Services,
  servicePreviews?: { uri: string }[],
  selectedDates?: Record<string, { isAvailable: boolean }>,
) => {
  return await prisma.services.create({
    data: {
      title: userService.title,
      description: userService.description,
      chargesPerHour: userService.chargesPerHour,
      userId: userService.userId,
      category: userService.category,
      servicePreview: servicePreviews?.length
        ? {
            create: servicePreviews.map((preview) => ({
              imageUri: preview.uri,
            })),
          }
        : undefined,
      schedule:
        selectedDates && Object.keys(selectedDates).length
          ? {
              create: Object.entries(selectedDates).map(
                ([date, { isAvailable }]) => ({
                  date,
                  isAvailable: isAvailable, // ✅ Fix: Keeping it as 'selected' since Prisma expects it
                }),
              ),
            }
          : undefined,
    },
  })
}

// const getServiceById = async (serviceId: string) => {
//   return await prisma.services.findUnique({
//     where: { id: serviceId },
//     include: {
//       servicePreview: true,
//       schedule: {
//         include: {
//           timeSlots: true,
//         },
//       },
//     },
//   })
// }

// const updateService = async (
//   serviceId: string,
//   updateData: Partial<Services>,
//   servicePreviews?: ServicePreview[],
//   schedules?: {
//     id: string
//     day: string
//     month: string
//     date: string
//     fullDate: Date
//     timeSlots: {
//       id: string
//       time: string
//       available: boolean
//     }[]
//   }[],
// ) => {
//   return await prisma.services.update({
//     where: { id: serviceId },
//     data: {
//       ...updateData,
//       servicePreview: servicePreviews
//         ? {
//             upsert: servicePreviews.map((preview) => ({
//               where: { id: preview.id || '' },
//               update: { imageUri: preview.imageUri },
//               create: { imageUri: preview.imageUri },
//             })),
//           }
//         : undefined,
//       schedule: schedules
//         ? {
//             upsert: schedules.map((schedule) => ({
//               where: { id: schedule.id || '' },
//               update: {
//                 day: schedule.day,
//                 month: schedule.month,
//                 date: schedule.date,
//                 fullDate: schedule.fullDate,
//                 timeSlots: {
//                   upsert: schedule.timeSlots.map((timeSlot) => ({
//                     where: { id: timeSlot.id || '' },
//                     update: {
//                       time: timeSlot.time,
//                       available: timeSlot.available,
//                     },
//                     create: {
//                       time: timeSlot.time,
//                       available: timeSlot.available,
//                     },
//                   })),
//                 },
//               },
//               create: {
//                 day: schedule.day,
//                 month: schedule.month,
//                 date: schedule.date,
//                 fullDate: schedule.fullDate,
//                 timeSlots: {
//                   create: schedule.timeSlots.map((timeSlot) => ({
//                     time: timeSlot.time,
//                     available: timeSlot.available,
//                   })),
//                 },
//               },
//             })),
//           }
//         : undefined,
//     },
//   })
// }

// const deleteService = async (servicesId: string) => {
//   // Delete all dependencies and then the service itself
//   // await prisma.$transaction([
//   //   prisma.timeSlot.deleteMany({
//   //     where: {
//   //       schedule: {
//   //         servicesId,
//   //       },
//   //     },
//   //   }),
//   //   prisma.schedule.deleteMany({
//   //     where: {
//   //       servicesId,
//   //     },
//   //   }),
//   //   prisma.servicePreview.deleteMany({
//   //     where: {
//   //       servicesId,
//   //     },
//   //   }),
//   //   prisma.services.delete({
//   //     where: {
//   //       id: servicesId,
//   //     },
//   //   }),
//   // ])

//   return await prisma.services.update({
//     where: { id: servicesId },
//     data: {
//       deletedAt: new Date(),
//     },
//   })
// }

const getMyService = async (id?: string) => {
  const services = await prisma.services.findMany({
    where: {
      deletedAt: null,
      isDisabled: false,
      // TODO: Disbaled for dev
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
      schedule: true, // Fetching schedule directly since timeSlots are removed
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
  console.log(userId, categories)

  const services = await prisma.services.findMany({
    where: {
      deletedAt: null,
      isDisabled: false,
      category: {
        in: categories,
      },
      // TODO: Disbaled for dev
      // userId: {
      //   not: userId,
      // },
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
      schedule: true, // Fetching schedule directly since timeSlots are removed
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
  console.log('asdsdsadsadsaa', userId, schedule)

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

  console.log('Res', res)
  return res
}

const getUpcomingEvents = async (userId: string) => {
  const bookedSchedules = await prisma.schedule.findMany({
    where: { bookedUserId: userId },
    include: {
      Services: {
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
    const service = schedule.Services
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
          chargesPerHour: service?.chargesPerHour,
          ratings: service?.ratings,
          category: service?.category,
          deletedAt: service?.deletedAt,
          isDisabled: service?.isDisabled,
          createdAt: service?.createdAt,
          updatedAt: service?.updatedAt,
          servicePreview: service?.servicePreview.map((preview) => ({
            id: preview.id,
            imageUri: preview.imageUri,
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

export default {
  createService,
  // getServiceById,
  // updateService,
  getMyService,
  // deleteService,
  getServicesByCategory,
  bookService,
  getUpcomingEvents,
}
