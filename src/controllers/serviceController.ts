import { Request, Response } from "express";
import service from "../services/service";
import { ApiError } from "../utils/ApiError";
import { ApiReponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";

export const getUserServices = asyncHandler(async (req: Request, res: Response) => {
    const response = await service.getUserServices(req.body.id);
    return res.status(201).json(new ApiReponse(200, response, 'User response'));

})
