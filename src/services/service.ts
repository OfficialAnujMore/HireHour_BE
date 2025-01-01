import { Role, Schedule, ServicePreview, Services } from "@prisma/client";
import prisma from "../prisma/client";
import { urlencoded } from "express";

const createUserService = async (userService: Services, servicePreviews?: ServicePreview[],
    schedules?: Schedule[]) => {
    // return await prisma.services.create({
    //     data: userService
    // })


    return await prisma.services.create({
        data: {
            title: userService.title,
            description: userService.description,
            chargesPerHour: userService.chargesPerHour,
            userId: userService.userId,
            servicePreview: servicePreviews
                ? {
                    create: servicePreviews
                }
                : undefined, // Skip if not provided
            schedule: schedules
                ? {
                    create: schedules, // Properly nest schedules
                }
                : undefined, // Skip if not provided

        }
    })
}

const getServiceProvidersWithServices = async (id?: string) => {
    return await prisma.user.findMany({
        where: {
            AND: [
                { userRole: Role.SERVICE_PROVIDER },
                { isDeleted: false },
                { isDisabled: false },
                ...(id ? [{ id }] : []), // Conditionally add ID filter if provided
            ],
        },
        include: {
            Services: {
                where: {
                    AND: [
                        { isDeleted: false },
                        { isDisabled: false },
                    ],
                },
                include: {
                    servicePreview: true,
                    schedule: true,
                },
            },
        },
    });
};

const deleteService = async (servicesId: string) => {
    await prisma.servicePreview.deleteMany({
        where: {
            servicesId: servicesId, // Foreign key linking previews to the service
        },
    });

    // Then delete the service itself
    return await prisma.services.delete({
        where: {
            id: servicesId,
        },
    });

}


export default { createUserService, getServiceProvidersWithServices,deleteService }