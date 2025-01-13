import { Request, Response } from "express";
import service from "../services/service";
import { ApiError } from "../utils/ApiError";
import { ApiReponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import userService from "../services/userService";
import { Role } from "@prisma/client";
import helperService from "../services/helperService";

export const addService = asyncHandler(async (req: Request, res: Response) => {

  const { id, userRole, serviceData } = req.body;


  if (!(userRole === Role.SERVICE_PROVIDER)) {
    return res.status(500).json(new ApiError(500, 'User not authorized to create services'))
  }

  const isValidUser = await helperService.verifyUser(id)

  if (!isValidUser) {
    return res.status(500).json(new ApiError(500, `Not a valid user`))
  }

  const response = await service.createUserService(serviceData, serviceData.servicePreview, serviceData.schedule);
  return res.status(201).json(new ApiReponse(200, response, 'All users deleted'));

})

export const getUserServices = asyncHandler(async (req: Request, res: Response) => {
  const response = await service.getServiceProvidersWithServices(req.body.id);
  console.log("REsponse", response);

  return res.status(201).json(new ApiReponse(200, response, 'User response'));

})

export const getServiceProviders = asyncHandler(async (req: Request, res: Response) => {
  const categories = req.query.category ? JSON.parse(req.query.category as string) : [];
  const response = await service.getServiceProviders(categories);
  return res.status(201).json(new ApiReponse(200, response, 'User response'));
})

export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const response = await service.deleteService(req.body.servicesId);

  return res.status(201).json(new ApiReponse(200, response, 'Service deleted successfully response'));
})
