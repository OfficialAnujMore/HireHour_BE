"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyBookedService = exports.handleSlotApproval = exports.holdSchedule = exports.getMyService = exports.deleteService = exports.upsertService = exports.getUpcomingEvents = exports.bookService = exports.getServicesByCategory = void 0;
const service_1 = __importDefault(require("../services/service"));
const transactionService_1 = __importDefault(require("../services/transactionService"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const helperService_1 = __importDefault(require("../services/helperService"));
const message_1 = require("../utils/message");
const fcmMessage_1 = require("../utils/fcmMessage");
const helperFunctions_1 = require("../utils/helperFunctions");
/**
 * 1. Create service - Done
 * 2. Get service by id
 * 3. Update service
 * 4. Delete service
 * 5. Get all services based on category   - Completed
 * 6. Get service providers services
 * 7. Book service - Completed
 * 8. Cancelled booked service
 * 9. Updated booked service
 * 10. Upcoming events - Completed
 * 11. Past events
 **/
// Controller to get all services based on user preferences (Category)
exports.getServicesByCategory = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    let categories = [];
    if (req.query.category) {
        try {
            categories = JSON.parse(req.query.category);
            if (!Array.isArray(categories)) {
                throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.invalidCategory);
            }
        }
        catch (error) {
            throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.invalidCategory);
        }
    }
    const response = await service_1.default.getServicesByCategory(req.query.id, categories);
    if (!response) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.errorInService);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, response, message_1.SUCCESS_MESSAGE.serviceRetreive));
});
// Controller to book a service
exports.bookService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, cartItems, paymentDetails } = req.body;
    const response = await service_1.default.bookService(userId, cartItems);
    if (!response) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.bookingFailure);
    }
    const transactionResponse = await transactionService_1.default.storeTransaction(userId, cartItems, paymentDetails);
    if (!transactionResponse) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.bookingFailure);
    }
    const fcmResponse = await helperService_1.default.getUserFCMToken(userId);
    if (fcmResponse?.fcmToken) {
        const body = {
            token: fcmResponse.fcmToken,
            title: fcmMessage_1.FCM_MESSAGE.slotBooked.title,
            body: fcmMessage_1.FCM_MESSAGE.slotBooked.body,
        };
        (0, helperFunctions_1.initializePushNotification)(body);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, transactionResponse, message_1.SUCCESS_MESSAGE.bookingSuccessFull));
});
// Controller to get upcoming events for a user
exports.getUpcomingEvents = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.body;
    const response = await service_1.default.getAllScheduledEvents(userId, true, true, new Date());
    if (!response) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.errorInService);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, response, message_1.SUCCESS_MESSAGE.serviceRetreive));
});
exports.upsertService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const serviceData = req.body;
    if (!serviceData) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.invalidData);
    }
    const serviceId = serviceData?.id || undefined;
    const response = await service_1.default.upsertService(serviceData, serviceId);
    if (!response) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.serviceFailure);
    }
    const message = serviceId
        ? message_1.SUCCESS_MESSAGE.serviceUpdated
        : message_1.SUCCESS_MESSAGE.serviceCreated;
    if (serviceData.userId) {
        const fcmResponse = await helperService_1.default.getUserFCMToken(serviceData.userId);
        if (fcmResponse?.fcmToken) {
            const body = {
                token: fcmResponse.fcmToken,
                title: fcmMessage_1.FCM_MESSAGE.slotCreated.body,
                body: message,
            };
            (0, helperFunctions_1.initializePushNotification)(body);
        }
    }
    return res
        .status(serviceId ? 200 : 201)
        .json(new ApiResponse_1.ApiResponse(serviceId ? 200 : 201, response, message));
});
exports.deleteService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const serviceId = req.query.serviceId;
    const fcmToken = req.query.fcmToken;
    if (!serviceId) {
        return res.status(400).json(new ApiError_1.ApiError(400, 'Service ID is required'));
    }
    const verifyExistingService = await helperService_1.default.verifyExistingService(serviceId);
    if (!verifyExistingService) {
        return res
            .status(404)
            .json(new ApiError_1.ApiError(404, message_1.ERROR_MESSAGE.serviceNotFound));
    }
    await service_1.default.deleteService(serviceId);
    if (fcmToken) {
        const body = {
            token: fcmToken,
            title: fcmMessage_1.FCM_MESSAGE.slotDeletion.title,
            body: fcmMessage_1.FCM_MESSAGE.slotDeletion.body,
        };
        (0, helperFunctions_1.initializePushNotification)(body);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, null, message_1.SUCCESS_MESSAGE.serviceDeleted));
});
// Controller to get all the services created by a service provider
exports.getMyService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const response = await service_1.default.getMyService(req.body.id);
    if (!response) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.errorInService);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, response, 'User services retrieved successfully'));
});
// Controller to hold a schedule for
exports.holdSchedule = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { schedule } = req.body;
    const holdVerification = await helperService_1.default.verifyScheduleAvailability(schedule);
    if (holdVerification.length > 0) {
        return res
            .status(409)
            .json(new ApiResponse_1.ApiResponse(409, holdVerification, 'Some slots are already been reserved'));
    }
    const response = await service_1.default.holdSchedule(schedule);
    if (!response) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.bookingFailure);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, response, message_1.SUCCESS_MESSAGE.bookingSuccessFull));
});
exports.handleSlotApproval = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { date, isApproved, bookedUser, services } = req.body;
    const { firstName, lastName } = services.user;
    const response = await service_1.default.handleSlotApproval(req.body);
    if (!response) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.errorInSlotApproval);
    }
    const fcmResponse = await helperService_1.default.getUserFCMToken(bookedUser.id);
    if (fcmResponse?.fcmToken) {
        const body = {
            token: fcmResponse.fcmToken,
            title: `Slot request ${isApproved ? 'Approved' : 'Rejected'} for ${(0, helperFunctions_1.formatDateUS)(date)}`,
            body: `${isApproved ? 'Approved' : 'Rejected'}  by ${firstName} ${lastName}`,
        };
        (0, helperFunctions_1.initializePushNotification)(body);
    }
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, response, 'Slot approved'));
});
// Controller to get all the services created by a service provider
exports.getMyBookedService = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id, type } = req.body;
    const response = await service_1.default.getMyBookedService({
        id,
        type,
    });
    if (!response) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.errorInService);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, response, 'User booked services retrieved successfully'));
});
