"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatDateUS = exports.initializePushNotification = exports.otpExpireAfter = exports.generateOTP = exports.generateTokens = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const firebase_1 = __importDefault(require("../../firebase"));
const generateTokens = async (data) => {
    const accessToken = jwt.sign({ data }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: process.env.ACCESS_TOKEN_EXPIRY });
    const refreshToken = jwt.sign({ data }, process.env.REFRESH_TOKEN_SECRET, { expiresIn: process.env.REFRESH_TOKEN_EXPIRY });
    return { accessToken, refreshToken };
};
exports.generateTokens = generateTokens;
const generateOTP = async () => {
    return Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
};
exports.generateOTP = generateOTP;
const otpExpireAfter = () => {
    const currentDate = new Date(); // Get current date and time
    currentDate.setMinutes(currentDate.getMinutes() + 10); // Add 10 minutes to current date
    return currentDate; // Return the updated date
};
exports.otpExpireAfter = otpExpireAfter;
const initializePushNotification = async ({ token, title, body }) => {
    const message = {
        token: token,
        notification: {
            title: title,
            body: body,
        },
    };
    try {
        const response = await firebase_1.default.messaging().send(message);
        return response;
    }
    catch (error) {
        return error; // Typecast error to `Error`
    }
};
exports.initializePushNotification = initializePushNotification;
const formatDateUS = (date) => {
    date = new Date(date);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-based
    const day = String(date.getDate() + 1).padStart(2, '0');
    return `${month}/${day}/${year}`;
};
exports.formatDateUS = formatDateUS;
