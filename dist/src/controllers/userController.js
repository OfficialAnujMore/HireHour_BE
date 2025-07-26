"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upsertFCMToken = exports.forgetPassword = exports.forgetUsername = exports.forgetEmail = exports.updateUserRole = exports.loginUser = exports.registerUser = exports.verifyOTP = exports.verifyPhoneNumber = exports.verifyEmailAndUsername = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const userService_1 = __importDefault(require("../services/userService"));
const constants_1 = require("../utils/constants");
const helperFunctions_1 = require("../utils/helperFunctions");
const ApiError_1 = require("../utils/ApiError");
const asyncHandler_1 = require("../utils/asyncHandler");
const ApiResponse_1 = require("../utils/ApiResponse");
const helperService_1 = __importDefault(require("../services/helperService"));
const message_1 = require("../utils/message");
const fcmMessage_1 = require("../utils/fcmMessage");
const emailService_1 = require("../utils/emailService");
exports.verifyEmailAndUsername = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { firstName, username, email, password } = req.body;
    if (!constants_1.EMAIL_REGEX.test(email)) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.invalidEmail);
    }
    if (!constants_1.USERNAME_REGEX.test(username)) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.invalidUsername);
    }
    if (!constants_1.PASSWORD_REGEX.test(password)) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.invalidPassword);
    }
    const duplicateEmail = await helperService_1.default.verifyEmail(email);
    if (duplicateEmail) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.duplicateEmail);
    }
    const duplicateUsername = await helperService_1.default.verifyUsername(username);
    if (duplicateUsername) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.duplicateUsername);
    }
    const emailOTP = await (0, helperFunctions_1.generateOTP)();
    const storePhoneOTPResponse = await helperService_1.default.storeOTP(emailOTP, email, 'email', 'registration', (0, helperFunctions_1.otpExpireAfter)());
    if (!storePhoneOTPResponse) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.otpGenerationFailed);
    }
    await (0, emailService_1.sendTemplatedEmail)({
        to: email,
        templateId: process.env.OTP_VERIFICATION_TEMPLATE_ID || '',
        dynamicTemplateData: {
            name: firstName,
            otp: emailOTP,
            year: new Date().getFullYear(),
        },
    });
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { otpStatus: true }, message_1.SUCCESS_MESSAGE.otpSuccess));
});
exports.verifyPhoneNumber = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phoneNumber } = req.body;
    const duplicatePhoneNumber = await helperService_1.default.verifyPhoneNumber(phoneNumber);
    if (duplicatePhoneNumber) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.duplicatePhoneNumber);
    }
    const phoneNumberOTP = await (0, helperFunctions_1.generateOTP)();
    const storeEmailOTPResponse = await helperService_1.default.storeOTP(phoneNumberOTP, phoneNumber, 'phoneNumber', 'phoneVerification', (0, helperFunctions_1.otpExpireAfter)());
    if (!storeEmailOTPResponse) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.otpGenerationFailed);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { otpStatus: true }, message_1.SUCCESS_MESSAGE.otpSuccess));
});
exports.verifyOTP = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { key, otp } = req.body;
    const OTPStatus = await helperService_1.default.verifyOTP(key);
    if (OTPStatus?.otp !== otp) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.invalidOTP);
    }
    const deleteOTPResponse = await helperService_1.default.deleteVerifiedOTP(key, otp);
    if (!deleteOTPResponse) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.otpVerifcationFailed);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { otpStatus: true }, message_1.SUCCESS_MESSAGE.otpVerified));
});
exports.registerUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const data = req.body;
    const { accessToken, refreshToken } = await (0, helperFunctions_1.generateTokens)({
        email: data.email,
    });
    data.token = accessToken;
    data.refreshToken = refreshToken;
    data.password = await bcrypt_1.default.hash(data.password, constants_1.BECRYPT_SALT_VALUE);
    const user = await userService_1.default.registerUser(data);
    if (!user) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.registrationFailure);
    }
    await (0, emailService_1.sendTemplatedEmail)({
        to: data.email,
        templateId: process.env.WELCOME_TEMPLATE_ID || '',
        dynamicTemplateData: {
            name: data.firstName,
            year: new Date().getFullYear(),
        },
    });
    return res
        .status(201)
        .json(new ApiResponse_1.ApiResponse(200, user, message_1.SUCCESS_MESSAGE.registerSuccess));
});
exports.loginUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email, password } = req.body;
    if (!constants_1.EMAIL_REGEX.test(email)) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.invalidEmail);
    }
    const userExist = await helperService_1.default.verifyEmail(email);
    if (!userExist) {
        throw new ApiError_1.ApiError(404, message_1.ERROR_MESSAGE.userEmailFound);
    }
    const isPasswordValid = await bcrypt_1.default.compare(password, userExist.password);
    if (!isPasswordValid || !constants_1.PASSWORD_REGEX.test(password)) {
        throw new ApiError_1.ApiError(401, message_1.ERROR_MESSAGE.invalidPassword);
    }
    const { accessToken, refreshToken } = await (0, helperFunctions_1.generateTokens)({ email });
    const userResponse = await userService_1.default.loginUser(email, accessToken, refreshToken);
    if (!userResponse) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.loginFailure);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, userResponse, message_1.SUCCESS_MESSAGE.loginSuccess));
});
exports.updateUserRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { id, isEnrolled } = req.body;
    if (!id) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.generalError);
    }
    const userExist = await helperService_1.default.verifyExistingUser(id);
    if (!userExist) {
        throw new ApiError_1.ApiError(404, message_1.ERROR_MESSAGE.userNotFound);
    }
    const roleUpdateStatus = await userService_1.default.updateUserRole(id, isEnrolled);
    if (!roleUpdateStatus) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.enrollmentFailure);
    }
    const fcmResponse = await helperService_1.default.getUserFCMToken(id);
    if (fcmResponse?.fcmToken) {
        const body = {
            token: fcmResponse.fcmToken,
            title: fcmMessage_1.FCM_MESSAGE.serviceProviderEnrollment.title,
            body: fcmMessage_1.FCM_MESSAGE.serviceProviderEnrollment.body,
        };
        (0, helperFunctions_1.initializePushNotification)(body);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, roleUpdateStatus, message_1.SUCCESS_MESSAGE.enrollmentSuccess));
});
exports.forgetEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { phoneNumber } = req.body;
    // Check if phone number exists
    const user = await helperService_1.default.verifyPhoneNumber(phoneNumber);
    if (!user) {
        throw new ApiError_1.ApiError(404, message_1.ERROR_MESSAGE.userNotFound);
    }
    const emailOTP = await (0, helperFunctions_1.generateOTP)();
    const storeEmailOTPResponse = await helperService_1.default.storeOTP(emailOTP, phoneNumber, 'phoneNumber', 'forgetEmail', (0, helperFunctions_1.otpExpireAfter)());
    if (!storeEmailOTPResponse) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.otpGenerationFailed);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { otpStatus: true }, message_1.SUCCESS_MESSAGE.otpSuccess));
});
exports.forgetUsername = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    // Check if the user exists with the provided email
    const user = await helperService_1.default.verifyEmail(email);
    if (!user) {
        throw new ApiError_1.ApiError(404, message_1.ERROR_MESSAGE.userNotFound);
    }
    const usernameOTP = await (0, helperFunctions_1.generateOTP)();
    const storeUsernameOTPResponse = await helperService_1.default.storeOTP(usernameOTP, email, 'email', 'forgetUsername', (0, helperFunctions_1.otpExpireAfter)());
    if (!storeUsernameOTPResponse) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.otpGenerationFailed);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { otpStatus: true }, message_1.SUCCESS_MESSAGE.otpSuccess));
});
exports.forgetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = req.body;
    // Check if the email exists
    const user = await helperService_1.default.verifyEmail(email);
    if (!user) {
        throw new ApiError_1.ApiError(404, message_1.ERROR_MESSAGE.userNotFound);
    }
    const passwordOTP = await (0, helperFunctions_1.generateOTP)();
    const storePasswordOTPResponse = await helperService_1.default.storeOTP(passwordOTP, email, 'email', 'forgetPassword', (0, helperFunctions_1.otpExpireAfter)());
    if (!storePasswordOTPResponse) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.otpGenerationFailed);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, { otpStatus: true }, message_1.SUCCESS_MESSAGE.otpSuccess));
});
exports.upsertFCMToken = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId, fcmToken } = req.body;
    if (!userId) {
        throw new ApiError_1.ApiError(400, message_1.ERROR_MESSAGE.generalError);
    }
    const userExist = await helperService_1.default.verifyExistingUser(userId);
    if (!userExist) {
        throw new ApiError_1.ApiError(404, message_1.ERROR_MESSAGE.userNotFound);
    }
    const response = await userService_1.default.upsertFCMToken(userId, fcmToken);
    if (!response) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.fcmTokenFailure);
    }
    return res.status(200).json(new ApiResponse_1.ApiResponse(200, response, ''));
});
