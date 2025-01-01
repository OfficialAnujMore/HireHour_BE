import { Request, Response } from 'express';
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

// REGISTER NEW USER 
export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const userData = req.body

  if (!EMAIL_REGEX.test(userData.email)) {
    return res.status(400).json(new ApiError(400, 'Invalid email address'))
  }

  if (!USERNAME_REGEX.test(userData.username)) {
    return res.status(400).json(new ApiError(400, 'Invalid email address'))
  }

  if (!PASSWORD_REGEX.test(userData.password)) {
    return res.status(400).json(new ApiError(400, 'Invalid password'))
  }

  const userExits = await helperService.validateDuplicateUser(userData.email
    , userData.username)


  if (userExits) {
    return res.status(400).json(new ApiError(400, 'User with the same email or username already exists'));
  }
  const { accessToken, refreshToken } = await generateTokens({ email: userData.email })
  userData.token = accessToken
  userData.refreshToken = refreshToken
  userData.password = await bcrypt.hash(userData.password, BECRYPT_SALT_VALUE);

  const user = await userService.registerUser(userData);

  return res.status(201).json(new ApiReponse(200, user, 'User successfull created'));

})

// LOGIN USER
export const loginUser = asyncHandler(async (req: Request, res: Response) => {

  const { email, password } = req.body;

  if ([email, password].some((field) => {
    field?.trim() == ""
  })) {
    return res.status(400).json(new ApiError(400, 'Invalid email or password'))
  }

  const userExist = await helperService.verifyUserEmail(email);

  if (!userExist) {
    return res.status(404).json(new ApiError(404, `User with this email doesn't exists`))
  }
  const isPasswordValid = await bcrypt.compare(password, userExist.password);

  if (!isPasswordValid) {
    return res.status(401).json(new ApiError(404, `Incorrect password`));
  }

  const { accessToken, refreshToken } = await generateTokens({ email: email })
  const userResponse = await userService.loginUser(email, accessToken, refreshToken);

  return res.status(201).json(new ApiReponse(200, userResponse, 'Login successful'));
})

// GET ALL USERS
export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    return res.status(500).json(new ApiError(500, 'Failed to fetch user details'))
  }
};

// UPDATE USER ROLE
export const updateUserRole = asyncHandler(async (req: Request, res: Response) => {


  const { id, userRole } = req.body
  console.log(userRole, Role.SERVICE_PROVIDER );
  
  if (userRole !== Role.CUSTOMER && userRole !== Role.SERVICE_PROVIDER) {
    return res.status(400).json(new ApiError(500, 'Invalid user role'))
  }
  if ([id, userRole].some((field) => {
    field?.trim() == ""
  })) {
    return res.status(400).json(new ApiError(400, 'Error'))
  }
  const response = await helperService.verifyUser(id);
  if (!response) {
    return res.status(500).json(new ApiError(500, 'Failed to update user role'))
  }
  const roleUpdateStatus = await userService.updateUserRole(id, userRole)
  if (!roleUpdateStatus) {
    return res.status(500).json(new ApiError(500, 'Failed to update user role'))

  }
  return res.status(201).json(new ApiReponse(200, roleUpdateStatus, 'User role updated successfull'));
})

// Get all active service providers
export const filterServiceProvider = asyncHandler(async (req:Request, res:Response)=>{

  const result = await service.getServiceProvidersWithServices();
})
// TODO: UPDATE USER DETAILS API - TRY TO COMBINE IT WITH UPDATE USER ROLE

export const deleteAllUsers = asyncHandler(async (req: Request, res: Response) => {
  console.warn('<<<<<<<<<<<<<<<<<<<<<<<<<<Delete all users triggered>>>>>>>>>>>>>>>>>>>>>>>>>>');
  const response = await userService.deleteAllUser()

  return res.status(201).json(new ApiReponse(200, response, 'All users deleted'));
})