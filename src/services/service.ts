import { Role, ServicePreview, Services } from "@prisma/client";
import prisma from "../prisma/client";

const createUserService = async (
    userService: Services,
    servicePreviews?: ServicePreview[],
    schedules?: {
        day: string;
        month: string;
        date: string; // Should remain as a string since it's separate from `fullDate`
        fullDate: Date;
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
    });
};

const getServiceProvidersWithServices = async (id?: string) => {
    const services = await prisma.user.findMany({
        where: {
            AND: [
                { userRole: Role.SERVICE_PROVIDER },
                { isDeleted: false },
                { isDisabled: false },
                ...(id ? [{ id }] : []),
            ],
        },
        select: {
            Services: {
                where: {
                    AND: [{ isDeleted: false }, { isDisabled: false }],
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
    });
    return services.flatMap(user => user.Services);
};

const deleteService = async (servicesId: string) => {
    // Delete all dependencies and then the service itself
    await prisma.$transaction([
        prisma.timeSlot.deleteMany({
            where: {
                schedule: {
                    servicesId,
                },
            },
        }),
        prisma.schedule.deleteMany({
            where: {
                servicesId,
            },
        }),
        prisma.servicePreview.deleteMany({
            where: {
                servicesId,
            },
        }),
        prisma.services.delete({
            where: {
                id: servicesId,
            },
        }),
    ]);
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
                    firstName: true,
                    lastName: true,
                    email: true,
                    username: true,
                    phoneNumber: true,
                    userRole: true,
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
    });

    // Shape the result to match the desired structure
    return services.map((service) => ({
        userId: service.user.id,
        name: `${service.user.firstName} ${service.user.lastName}`,
        email: service.user.email,
        username: service.user.username,
        phoneNumber: service.user.phoneNumber,
        userRole: service.user.userRole,
        avatarUri: service.user.avatarUri || "",
        serviceId: service.id,
        title: service.title,
        description: service.description,
        chargesPerHour: service.chargesPerHour,
        ratings:service.ratings,
        category: service.category,
        isDeleted: service.isDeleted,
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
    }));
};

export default { createUserService, getServiceProvidersWithServices, deleteService, getServiceProviders };
