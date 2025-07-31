"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../prisma/client"));
const cloudinaryService_1 = require("../utils/cloudinaryService");
const imageUtils_1 = require("../utils/imageUtils");
const getMyService = async (id) => {
    const services = await client_1.default.services.findMany({
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
    });
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
    }));
};
const getServicesByCategory = async (userId, categories) => {
    const services = await client_1.default.services.findMany({
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
    });
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
    }));
};
const bookService = async (userId, cartItems) => {
    const updatePromises = [];
    cartItems.forEach((cartItem) => {
        cartItem.schedule.forEach((scheduleItem) => {
            updatePromises.push(client_1.default.schedule.update({
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
            }));
        });
    });
    const res = await Promise.all(updatePromises);
    return res;
};
const getAllScheduledEvents = async (userId, isApproved, isUpcoming, date) => {
    // const now = new Date()
    const now = new Date();
    now.setDate(now.getDate() - 1);
    now.setUTCHours(0, 0, 0, 0); // Set the time to 00:00:00.000
    // const formattedTime = now.toISOString() // This will give you the date in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ)
    const dateCondition = isUpcoming
        ? { gt: now } // Upcoming: date is after now
        : { lte: now }; // Past: date is now or before
    console.log({
        bookedUserId: userId,
        isApproved: isApproved,
        date: dateCondition,
    });
    // Fetch all schedules booked by the user
    const allSchedules = await client_1.default.schedule.findMany({
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
    });
    return allSchedules;
};
const upsertService = async (serviceData, serviceId) => {
    // Handle image uploads if servicePreview exists
    let processedServicePreview = serviceData.servicePreview;
    if (serviceData.servicePreview?.length) {
        const imagesToUpload = [];
        const processedImages = [];
        for (const preview of serviceData.servicePreview) {
            // If it's already a remote URL (Cloudinary), keep it as is
            if ((0, imageUtils_1.isRemoteUrl)(preview.uri)) {
                processedImages.push({ uri: preview.uri });
                continue;
            }
            // If it's a base64 image, convert to buffer for upload
            if (preview.isBase64 || (0, imageUtils_1.isValidBase64Image)(preview.uri)) {
                try {
                    const imageBuffer = (0, imageUtils_1.base64ToBuffer)(preview.uri);
                    imagesToUpload.push(imageBuffer);
                }
                catch (error) {
                    console.error('Error converting base64 to buffer:', error);
                    throw new Error('Invalid image format');
                }
            }
            else {
                // For local file URIs, we'll need to handle them differently
                // For now, we'll skip them and log a warning
                console.warn('Local file URI detected, skipping:', preview.uri);
                continue;
            }
        }
        // Upload images to Cloudinary if there are any to upload
        if (imagesToUpload.length > 0) {
            try {
                const uploadResults = await (0, cloudinaryService_1.uploadMultipleImagesToCloudinary)(imagesToUpload, `hirehour-services/user-${serviceData.userId}`);
                // Add uploaded image URLs to processed images
                uploadResults.forEach((result) => {
                    processedImages.push({ uri: result.secure_url });
                });
            }
            catch (error) {
                console.error('Error uploading images to Cloudinary:', error);
                throw new Error('Failed to upload images');
            }
        }
        processedServicePreview = processedImages;
    }
    if (serviceId) {
        // Update existing service: delete old records first
        await client_1.default.servicePreview.deleteMany({
            where: { servicesId: serviceId },
        });
        await client_1.default.schedule.deleteMany({
            where: { servicesId: serviceId },
        });
    }
    // Prepare service payload
    const servicePayload = {
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
        schedule: serviceData.selectedDates && Object.keys(serviceData.selectedDates).length
            ? {
                create: Object.entries(serviceData.selectedDates)
                    .filter(([_, { isAvailable }]) => isAvailable) // Only include dates with isAvailable true
                    .map(([date, { isAvailable }]) => ({
                    date,
                    isAvailable,
                })),
            }
            : undefined,
    };
    if (serviceId) {
        return await client_1.default.services.update({
            where: { id: serviceId },
            data: servicePayload,
            include: {
                servicePreview: true,
                schedule: true,
            },
        });
    }
    else {
        return await client_1.default.services.create({
            data: servicePayload,
            include: {
                servicePreview: true,
                schedule: true,
            },
        });
    }
};
const deleteService = async (serviceId) => {
    // Soft delete the service by updating the 'deletedAt' field
    await client_1.default.services.update({
        where: { id: serviceId },
        data: {
            deletedAt: new Date(), // Mark service as deleted by setting 'deletedAt'
        },
    });
    // Permanently delete the related servicePreview
    await client_1.default.servicePreview.deleteMany({
        where: { servicesId: serviceId }, // Correct field to reference the serviceId
    });
    // Permanently delete the related schedule
    await client_1.default.schedule.deleteMany({
        where: { servicesId: serviceId }, // Correct field to reference the serviceId
    });
};
const getServiceById = async (id) => {
    return await client_1.default.services.findFirst({
        where: {
            AND: [{ id: id }],
        },
    });
};
const holdSchedule = async (schedule) => {
    const holdDurationInMinutes = 15;
    const holdUntilTime = new Date(Date.now() + holdDurationInMinutes * 60 * 1000);
    const updatePromises = schedule.map((scheduleItem) => client_1.default.schedule.update({
        where: { id: scheduleItem.id },
        data: {
            isAvailable: false,
            holdExpiresAt: holdUntilTime,
        },
    }));
    return await Promise.all(updatePromises);
};
const handleSlotApproval = async (slotDetails) => {
    const baseUpdate = {
        isApproved: slotDetails.isApproved,
    };
    if (!slotDetails.isApproved) {
        baseUpdate.isAvailable = true;
        baseUpdate.bookedUserId = null;
    }
    else {
        baseUpdate.isAvailable = slotDetails.isAvailable;
        baseUpdate.isApproved = slotDetails.isApproved;
    }
    console.log(slotDetails);
    return client_1.default.schedule.update({
        where: { id: slotDetails.id },
        data: baseUpdate,
    });
};
const getMyBookedService = async ({ id, type, }) => {
    const currentDate = new Date();
    let dateFilter;
    let isApproved = true;
    currentDate.setUTCHours(0, 0, 0, 0);
    if (type === 'Upcoming') {
        dateFilter = { gte: currentDate };
    }
    else if (type === 'Past') {
        dateFilter = { lt: currentDate };
    }
    else {
        dateFilter = { gte: currentDate };
        isApproved = false;
    }
    const bookedSchedules = await client_1.default.schedule.findMany({
        where: {
            isApproved,
            date: dateFilter,
            bookedUserId: {
                not: null, // ✅ Only fetch schedules that have a booked user
            },
            services: {
                userId: id,
                deletedAt: null,
                isDisabled: false,
            },
        },
        include: {
            bookedUser: {
                select: {
                    id: true,
                    firstName: true,
                    lastName: true,
                    email: true,
                    phoneNumber: true,
                    avatarUri: true,
                },
            },
            services: {
                include: {
                    servicePreview: true,
                    user: {
                        select: {
                            firstName: true,
                            lastName: true,
                        },
                    },
                },
            },
        },
    });
    return bookedSchedules;
};
exports.default = {
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
};
