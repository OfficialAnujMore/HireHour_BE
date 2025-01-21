import { Request, Response } from "express";
import service from "../services/service";
import { ApiError } from "../utils/ApiError";
import { ApiReponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asyncHandler";
import userService from "../services/userService";
import { Role } from "@prisma/client";
import helperService from "../services/helperService";


// Controller to add a service
export const addService = asyncHandler(async (req: Request, res: Response) => {
  const { id, userRole, serviceData } = req.body;

  // Ensure the user is a service provider
  if (!(userRole === Role.SERVICE_PROVIDER)) {
    return res.status(403).json(new ApiError(403, 'User not authorized to create services'));
  }

  // Verify if the user is valid
  const isValidUser = await helperService.verifyUser(id);
  if (!isValidUser) {
    return res.status(400).json(new ApiError(400, 'Not a valid user'));
  }

  // Create the service
  const response = await service.createUserService(serviceData, serviceData.servicePreview, serviceData.schedule);
  return res.status(201).json(new ApiReponse(201, response, 'Service created successfully'));
});

// Controller to get all services for a specific user
export const getUserServices = asyncHandler(async (req: Request, res: Response) => {
  const response = await service.getServiceProvidersWithServices(req.body.id);
  return res.status(200).json(new ApiReponse(200, response, 'User services retrieved successfully'));
});

// Controller to get service providers by category
export const getServiceProviders = asyncHandler(async (req: Request, res: Response) => {
  let categories: string[] = [];
  if (req.query.category) {
    try {
      categories = JSON.parse(req.query.category as string);
      if (!Array.isArray(categories)) {
        return res.status(400).json(new ApiError(400, 'Invalid category format'));
      }
    } catch (error) {
      return res.status(400).json(new ApiError(400, 'Invalid JSON format for category'));
    }
  }

  const response = await service.getServiceProviders(categories);
  return res.status(200).json(new ApiReponse(200, response, 'Service providers retrieved successfully'));
});

// Controller to delete a service by ID
export const deleteService = asyncHandler(async (req: Request, res: Response) => {
  const { servicesId } = req.body;

  // Validate the servicesId
  if (!servicesId) {
    return res.status(400).json(new ApiError(400, 'Service ID is required'));
  }

  const response = await service.deleteService(servicesId);
  return res.status(200).json(new ApiReponse(200, response, 'Service deleted successfully'));
});