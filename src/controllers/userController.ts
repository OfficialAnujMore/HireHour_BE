import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import userService from '../services/userService';
import { BECRYPT_SALT_VALUE, EMAIL_REGEX, PASSWORD_REGEX, USERNAME_REGEX } from '../utils/constants';
import { generateTokens } from '../utils/commonFunction';
import { ApiError } from '../utils/ApiError';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiReponse } from '../utils/ApiResponse';

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers();
    res.json(users);
  } catch (error) {
    return res.status(500).json(new ApiError(500, 'Failed to fetch user details'))
  }
};

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

  const userExits = await userService.validateDuplicateUser(userData.email
    , userData.username)


  if (userExits) {
    return res.status(400).json(new ApiError(400, 'User with the same email or username already exists'));
  }
  const { accessToken, refreshToken } = await generateTokens({ email: userData.email, username: userData.username })
  userData.token = accessToken
  userData.refreshToken = refreshToken
  userData.password = await bcrypt.hash(userData.password, BECRYPT_SALT_VALUE);

  const user = await userService.registerUser(req.body);

  return res.status(201).json(new ApiReponse(200, user, 'User successfull created'));

})

export const deleteAllUsers = asyncHandler(async (req: Request, res: Response) => {
  console.log('Delete all users triggered');

  const response = await userService.deleteAllUser()

  return res.status(201).json(new ApiReponse(200, response, 'All users deleted'));
})