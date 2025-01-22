import { NextFunction, Request, Response } from "express";
import bcrypt from 'bcrypt';
import userService from '../services/userService';
import { BECRYPT_SALT_VALUE, EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from '../utils/constants';
import { generateTokens } from '../utils/commonFunction';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiReponse } from '../utils/ApiResponse';
import { Role } from '@prisma/client';
import helperService from '../services/helperService';
import prisma from '../prisma/client';
import service from '../services/service';

// Helper function to handle empty fields
const isFieldEmpty = (fields: string[]): boolean => {
  return fields.some(field => field.trim() === "");
};

// Define types for request bodies
interface RegisterUserBody {
  firstName: string;
  lastName: string;
  email: string;
  username: string;
  phoneNumber: string;
  password: string;
  token: string;
  refreshToken: string;
}

interface LoginUserBody {
  email: string;
  password: string;
}

interface UpdateUserRoleBody {
  id: string;
  isEnrolled: boolean;
}

// REGISTER NEW USER 
export const registerUser = asyncHandler(async (req: Request<{}, {}, RegisterUserBody>, res: Response) => {
  const userData = req.body;
  if (!EMAIL_REGEX.test(userData.email)) {
    return res.status(400).json(new ApiError(400, 'Invalid email address'));
  }

  if (!USERNAME_REGEX.test(userData.username)) {
    return res.status(400).json(new ApiError(400, 'Invalid username'));
  }

  if (!PASSWORD_REGEX.test(userData.password)) {
    return res.status(400).json(new ApiError(400, 'Invalid password'));
  }

  const userExists = await helperService.validateDuplicateUser(userData.email, userData.username);
  if (userExists) {
    return res.status(400).json(new ApiError(400, 'User with the same email or username already exists'));
  }

  const { accessToken, refreshToken } = await generateTokens({ email: userData.email });
  userData.token = accessToken;
  userData.refreshToken = refreshToken;
  userData.password = await bcrypt.hash(userData.password, BECRYPT_SALT_VALUE);

  try {
    const user = await userService.registerUser(userData);
    return res.status(201).json(new ApiReponse(200, user, 'User successfully created'));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, 'Failed to register user', err));
  }
});

// LOGIN USER
export const loginUser = asyncHandler(async (req: Request<{}, {}, LoginUserBody>, res: Response) => {
  const { email, password } = req.body;

  if (isFieldEmpty([email, password])) {
    return res.status(400).json(new ApiError(400, 'Invalid email or password'));
  }

  const userExist = await helperService.verifyUserEmail(email);
  if (!userExist) {
    return res.status(404).json(new ApiError(404, `User with this email doesn't exist`));
  }

  const isPasswordValid = await bcrypt.compare(password, userExist.password);
  if (!isPasswordValid) {
    return res.status(401).json(new ApiError(401, `Incorrect password`));
  }

  const { accessToken, refreshToken } = await generateTokens({ email });
  const userResponse = await userService.loginUser(email, accessToken, refreshToken);

  return res.status(200).json(new ApiReponse(200, userResponse, 'Login successful'));
});

// GET ALL USERS
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.status(200).json(users);
  } catch (error) {
    return res.status(500).json(new ApiError(500, 'Failed to fetch user details'));
  }
};

// UPDATE USER ROLE
export const updateUserRole = asyncHandler(async (req: Request<{}, {}, UpdateUserRoleBody>, res: Response) => {
  const { id, isEnrolled } = req.body;

  if (!id) {
    return res.status(400).json(new ApiError(400, 'Invalid input or role'));
  }

  try {
    const userExist = await helperService.verifyUser(id);
    if (!userExist) {
      return res.status(404).json(new ApiError(404, 'User not found'));
    }

    const roleUpdateStatus = await userService.updateUserRole(id, isEnrolled ? Role.SERVICE_PROVIDER : Role.CUSTOMER);
    if (!roleUpdateStatus) {
      return res.status(500).json(new ApiError(500, 'Failed to update user role'));
    }

    return res.status(200).json(new ApiReponse(200, roleUpdateStatus, 'User role updated successfully'));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, 'Error while updating role', err));
  }
});

// Get all active service providers
export const filterServiceProvider = asyncHandler(async (req: Request, res: Response) => {
  try {
    const result = await service.getServiceProvidersWithServices();
    return res.status(200).json(result);
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, 'Failed to fetch service providers', err));
  }
});

// DELETE ALL USERS
export const deleteAllUsers = asyncHandler(async (req: Request, res: Response) => {
  try {
    const response = await userService.deleteAllUser();
    return res.status(200).json(new ApiReponse(200, response, 'All users deleted'));
  } catch (err: any) {
    return res.status(500).json(new ApiError(500, 'Failed to delete all users', err));
  }
});
