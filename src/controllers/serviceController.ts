import { Request, Response } from "express";
import service from "../services/service";
import { ApiError } from "../utils/ApiError";
import { ApiReponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import userService from "../services/userService";

export const addService = asyncHandler(async (req: Request, res: Response) => {

  const { id, userRole, serviceData } = req.body;

  const isValidUser = await userService.validateUserRole(id, userRole)

  if (!isValidUser) {
    return res.status(500).json(new ApiError(500, 'User not authorized to create services'))
  }

  const response = await service.createUserService(serviceData);
  return res.status(201).json(new ApiReponse(200, response, 'All users deleted'));

})

export const getUserServices = asyncHandler(async (req: Request, res: Response) => {
    const response = await service.getUserServices(req.body.id);
    return res.status(201).json(new ApiReponse(200, response, 'User response'));

})
