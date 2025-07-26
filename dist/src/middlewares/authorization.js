"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorization = void 0;
const ApiError_1 = require("../utils/ApiError");
const client_1 = __importDefault(require("../prisma/client"));
const authorization = async (req, res, next) => {
    const user = req.user; // Access the user data attached in the authentication middleware
    if (!user) {
        return res.status(403).json(new ApiError_1.ApiError(403, 'Forbidden: No user data'));
    }
    // Check if the email exists in the user object
    if (!user.data.email) {
        return res
            .status(400)
            .json(new ApiError_1.ApiError(400, 'Bad Request: Email is missing in user data'));
    }
    try {
        // Find the user by their email
        const foundUser = await client_1.default.user.findUnique({
            where: {
                email: user.data.email,
            },
        });
        if (!foundUser) {
            return res
                .status(403)
                .json(new ApiError_1.ApiError(403, 'Forbidden: User not found'));
        }
        // Ensure the user is a service provider
        if (!foundUser.isServiceProvider) {
            return res
                .status(403)
                .json(new ApiError_1.ApiError(403, 'Forbidden: Not a service provider'));
        }
        // User is authorized, move to the next middleware or route handler
        next();
    }
    catch (error) {
        console.error(error);
        return res.status(500).json(new ApiError_1.ApiError(500, 'Internal Server Error'));
    }
};
exports.authorization = authorization;
