"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = __importDefault(require("../prisma/client"));
const ApiResponseConstants_1 = require("../utils/ApiResponseConstants");
const registerUser = async (data) => {
    return await client_1.default.user.create({
        data,
        select: ApiResponseConstants_1.CREATE_PREVIEW,
    });
};
const loginUser = async (email, accessToken, refreshToken) => {
    return await client_1.default.user.update({
        where: {
            email: email,
        },
        data: {
            token: accessToken,
            refreshToken: refreshToken,
            lastLogin: new Date(),
        },
        select: ApiResponseConstants_1.CREATE_PREVIEW,
    });
};
const updateUserRole = async (id, isEnrolled) => {
    return await client_1.default.user.update({
        where: {
            id: id,
        },
        data: {
            isServiceProvider: isEnrolled,
        },
        select: ApiResponseConstants_1.UPDATE_PREVIEW,
    });
};
const validateUserRole = async (id, isServiceProvider) => {
    return await client_1.default.user.findFirst({
        where: {
            AND: [{ id }, { isServiceProvider }],
        },
        select: ApiResponseConstants_1.UPDATE_PREVIEW,
    });
};
const upsertFCMToken = async (userId, fcmToken) => {
    return await client_1.default.user.update({
        where: {
            id: userId,
        },
        data: {
            fcmToken: fcmToken,
        },
        select: ApiResponseConstants_1.UPDATE_PREVIEW,
    });
};
exports.default = {
    registerUser,
    loginUser,
    updateUserRole,
    validateUserRole,
    upsertFCMToken
};
