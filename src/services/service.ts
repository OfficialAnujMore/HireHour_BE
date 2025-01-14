import { Role, ServicePreview, Services } from "@prisma/client";
import prisma from "../prisma/client";
const createUserService = async (
    userService: Services,
    servicePreviews?: ServicePreview[],
    schedules?: {
        day: string;
        month: string;
        date: string; // Change this to Date if it's supposed to be a Date object
        fullDate: Date; // This needs to be a Date object
        timeSlots: {
            time: string;
            available: boolean;
        }[];
    }[]
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
                    create: servicePreviews,
                }
                : undefined, // Skip if not provided
            schedule: schedules
                ? {
                    create: schedules.map((schedule) => ({
                        day: schedule.day,
                        month: schedule.month,
                        date: schedule.date, // Convert date string to Date object
                        fullDate: new Date(schedule.fullDate), // Ensure fullDate is a Date object
                        timeSlots: {
                            create: schedule.timeSlots.map((timeSlot) => ({
                                time: timeSlot.time,
                                available: timeSlot.available,
                            })),
                        },
                    })),
                }
                : undefined, // Skip if not provided
        },
    });
};



const getServiceProvidersWithServices = async (id?: string) => {
    return await prisma.user.findMany({
        where: {
            AND: [
                { userRole: Role.SERVICE_PROVIDER },
                { isDeleted: false },
                { isDisabled: false },
                ...(id ? [{ id }] : []),
            ],
        },
        include: {
            Services: {
                where: {
                    AND: [{ isDeleted: false }, { isDisabled: false }],
                },
                include: {
                    servicePreview: true,
                    schedule: {
                        include: {
                            timeSlots: true, // Include time slots for each schedule
                        },
                    },
                },
            },
        },
    });
};

const deleteService = async (servicesId: string) => {
    // Delete time slots associated with schedules
    await prisma.timeSlot.deleteMany({
        where: {
            schedule: {
                servicesId,
            },
        },
    });

    // Delete schedules associated with the service
    await prisma.schedule.deleteMany({
        where: {
            servicesId,
        },
    });

    // Delete service previews associated with the service
    await prisma.servicePreview.deleteMany({
        where: {
            servicesId,
        },
    });

    // Then delete the service itself
    return await prisma.services.delete({
        where: {
            id: servicesId,
        },
    });
};

const getServiceProviders = async (categories: string[]) => {
    const services = await prisma.services.findMany({
        where: {
            isDeleted: false,
            isDisabled: false,
            category: {
                in: categories,
            },
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    username: true,
                    countryCode: true,
                    phoneNumber: true,
                    userRole: true,
                    profileImageURL: true,
                    bannerImageURL: true,
                },
            },
            servicePreview: true,
            schedule: {
                include: {
                    timeSlots: true, // Include time slots for each schedule
                },
            },
        },
    });

    // Shape the result to match the desired structure
    const result = services.map(service => ({
        userId: service.user.id,
        name: service.user.name,
        email: service.user.email,
        username: service.user.username,
        countryCode: service.user.countryCode,
        phoneNumber: service.user.phoneNumber,
        userRole: service.user.userRole,
        profileImageURL: service.user.profileImageURL || "",
        bannerImageURL: service.user.bannerImageURL || "",
        serviceId: service.id,
        title: service.title,
        description: service.description,
        chargesPerHour: service.chargesPerHour,
        category: service.category,
        isDeleted: service.isDeleted,
        isDisabled: service.isDisabled,
        createdAt: service.createdAt,
        updatedAt: service.updatedAt,
        servicePreview: service.servicePreview.map(preview => ({
            id: preview.id,
            imageURL: preview.imageURL,
            servicesId: preview.servicesId,
        })),
        schedule: service.schedule.map(sched => ({
            id: sched.id,
            day: sched.day,
            month: sched.month,
            date: sched.date,
            fullDate: sched.date,
            servicesId: sched.servicesId,
            timeSlots: sched.timeSlots.map(slot => ({
                id: slot.id,
                time: slot.time,
                available: slot.available,
            })),
        })),
    }));

    return result;
};

export default { createUserService, getServiceProvidersWithServices, deleteService, getServiceProviders };
