"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyTransactions = void 0;
const transactionService_1 = __importDefault(require("../services/transactionService"));
const ApiError_1 = require("../utils/ApiError");
const ApiResponse_1 = require("../utils/ApiResponse");
const asyncHandler_1 = require("../utils/asyncHandler");
const message_1 = require("../utils/message");
// Controller to get all the user transaction
exports.getMyTransactions = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { userId } = req.body;
    const response = await transactionService_1.default.getMyTransactions(userId);
    if (!response) {
        throw new ApiError_1.ApiError(500, message_1.ERROR_MESSAGE.errorInService);
    }
    return res
        .status(200)
        .json(new ApiResponse_1.ApiResponse(200, response, 'User transaction retrieved successfully'));
});
