"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../prisma/client"));
const ApiResponseConstants_1 = require("../utils/ApiResponseConstants");
// HELPER FUNCTIONS
const verifyEmail = async (email) => {
    return await client_1.default.user.findUnique({
        where: {
            email,
        },
    });
};
const verifyUsername = async (username) => {
    return await client_1.default.user.findFirst({
        where: {
            username: username,
        },
        select: ApiResponseConstants_1.CREATE_PREVIEW,
    });
};
const verifyPhoneNumber = async (phoneNumber) => {
    return await client_1.default.user.findFirst({
        where: {
            phoneNumber: phoneNumber,
        },
        select: ApiResponseConstants_1.CREATE_PREVIEW,
    });
};
const storeOTP = async (otp, key, field, type, expireAfter) => {
    return await client_1.default.otp.create({
        data: {
            otp,
            key,
            field,
            type,
            expireAfter,
        },
    });
};
const verifyOTP = async (key) => {
    return await client_1.default.otp.findFirst({
        where: {
            key: key,
        },
        select: {
            otp: true,
        },
    });
};
const deleteVerifiedOTP = async (key, otp) => {
    return await client_1.default.otp.deleteMany({
        where: {
            key: key,
        },
    });
};
const verifyExistingUser = async (id) => {
    return await client_1.default.user.findFirst({
        where: {
            AND: [{ id: id }, { isDisabled: false }, { deletedAt: null }],
        },
        select: ApiResponseConstants_1.CREATE_PREVIEW,
    });
};
const verifyExistingService = async (id) => {
    return await client_1.default.services.findFirst({
        where: {
            AND: [{ id: id }, { isDisabled: false }, { deletedAt: null }],
        },
    });
};
const getUserFCMToken = async (id) => {
    return await client_1.default.user.findFirst({
        where: {
            AND: { id: id },
        },
    });
};
const verifyScheduleAvailability = async (schedule) => {
    const responsePromise = schedule.map((scheduleItem) => client_1.default.schedule.findMany({
        where: {
            AND: [
                { id: scheduleItem.id },
                {
                    isAvailable: false,
                },
            ],
        },
    }));
    const nestedResult = await Promise.all(responsePromise);
    const flatResult = nestedResult.flat(); // flatten the arrays
    return flatResult;
};
exports.default = {
    verifyEmail,
    verifyUsername,
    verifyPhoneNumber,
    verifyExistingUser,
    storeOTP,
    verifyOTP,
    deleteVerifiedOTP,
    verifyExistingService,
    getUserFCMToken,
    verifyScheduleAvailability,
};
