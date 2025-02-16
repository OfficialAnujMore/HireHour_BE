import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import userService from '../services/userService'
import {
  BECRYPT_SALT_VALUE,
  EMAIL_REGEX,
  PASSWORD_REGEX,
  USERNAME_REGEX,
} from '../utils/constants'
import {
  generateOTP,
  generateTokens,
  otpExpireAfter,
} from '../utils/helperFunctions'
import { ApiError } from '../utils/ApiError'
import { asyncHandler } from '../utils/asyncHandler'
import { ApiResponse } from '../utils/ApiResponse'
import helperService from '../services/helperService'
import {
  LoginUserBody,
  RegisterUserBody,
  UpdateUserRoleBody,
  ValidatePhoneNumber,
  ValidateUsernameAndEmailBody,
} from '../interfaces/userInterface'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '../utils/message'

export const verifyEmailAndUsername = asyncHandler(
  async (req: Request<{}, {}, ValidateUsernameAndEmailBody>, res: Response) => {
    const { username, email, password } = req.body

    if (!EMAIL_REGEX.test(email)) {
      throw new ApiError(400, ERROR_MESSAGE.invalidEmail)
    }

    if (!USERNAME_REGEX.test(username)) {
      throw new ApiError(400, ERROR_MESSAGE.invalidUsername)
    }

    if (!PASSWORD_REGEX.test(password)) {
      throw new ApiError(400, ERROR_MESSAGE.invalidPassword)
    }

    const duplicateEmail = await helperService.validateUserEmail(email)
    if (duplicateEmail) {
      throw new ApiError(400, ERROR_MESSAGE.duplicateEmail)
    }

    const duplicateUsername = await helperService.validateUsername(username)
    if (duplicateUsername) {
      throw new ApiError(400, ERROR_MESSAGE.duplicateUsername)
    }

    const emailOTP = await generateOTP()
    const storePhoneOTPResponse = await helperService.storeOTP(
      emailOTP,
      email,
      'email',
      'registration',
      otpExpireAfter(),
    )

    if (!storePhoneOTPResponse) {
      throw new ApiError(500, ERROR_MESSAGE.otpGenerationFailed)
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { otpStatus: true }, SUCCESS_MESSAGE.OTPSuccess),
      )
  },
)

export const verifyPhoneNumber = asyncHandler(
  async (req: Request<{}, {}, ValidatePhoneNumber>, res: Response) => {
    const { phoneNumber } = req.body

    const duplicatePhoneNumber =
      await helperService.validatePhoneNumber(phoneNumber)
    if (duplicatePhoneNumber) {
      throw new ApiError(400, ERROR_MESSAGE.duplicatePhoneNumber)
    }

    const phoneNumberOTP = await generateOTP()
    const storeEmailOTPResponse = await helperService.storeOTP(
      phoneNumberOTP,
      phoneNumber,
      'phoneNumber',
      'phoneVerification',
      otpExpireAfter(),
    )

    if (!storeEmailOTPResponse) {
      throw new ApiError(500, ERROR_MESSAGE.otpGenerationFailed)
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { otpStatus: true }, SUCCESS_MESSAGE.OTPSuccess),
      )
  },
)

export const verifyOTP = asyncHandler(
  async (req: Request<{}, {}, { key: string; otp: string }>, res: Response) => {
    const { key, otp } = req.body

    const OTPStatus = await helperService.verifyOTP(key)

    if (OTPStatus?.otp !== otp) {
      throw new ApiError(400, ERROR_MESSAGE.invalidOTP)
    }

    const deleteOTPResponse = await helperService.deleteVerifiedOTP(key, otp)

    if (!deleteOTPResponse) {
      throw new ApiError(500, ERROR_MESSAGE.otpVerifcationFailed)
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { otpStatus: true }, SUCCESS_MESSAGE.otpVerified),
      )
  },
)

export const registerUser = asyncHandler(
  async (req: Request<{}, {}, RegisterUserBody>, res: Response) => {
    const data = req.body
    const { accessToken, refreshToken } = await generateTokens({
      email: data.email,
    })
    data.token = accessToken
    data.refreshToken = refreshToken
    data.password = await bcrypt.hash(data.password, BECRYPT_SALT_VALUE)
    
    const user = await userService.registerUser(data)

    if (!user) {
      throw new ApiError(500, ERROR_MESSAGE.registrationFailure)
    }

    return res
      .status(201)
      .json(new ApiResponse(200, user, SUCCESS_MESSAGE.registerSuccess))
  },
)

export const loginUser = asyncHandler(
  async (req: Request<{}, {}, LoginUserBody>, res: Response) => {
    const { email, password } = req.body

    if (!EMAIL_REGEX.test(email)) {
      throw new ApiError(400, ERROR_MESSAGE.invalidEmail)
    }

    const userExist = await helperService.verifyUserEmail(email)
    if (!userExist) {
      throw new ApiError(404, ERROR_MESSAGE.userEmailFound)
    }

    const isPasswordValid = await bcrypt.compare(password, userExist.password)
    if (!isPasswordValid || !PASSWORD_REGEX.test(password)) {
      throw new ApiError(401, ERROR_MESSAGE.invalidPassword)
    }

    const { accessToken, refreshToken } = await generateTokens({ email })
    const userResponse = await userService.loginUser(
      email,
      accessToken,
      refreshToken,
    )

    if (!userResponse) {
      throw new ApiError(500, ERROR_MESSAGE.loginFailure)
    }

    return res
      .status(200)
      .json(new ApiResponse(200, userResponse, SUCCESS_MESSAGE.loginSuccess))
  },
)

export const updateUserRole = asyncHandler(
  async (req: Request<{}, {}, UpdateUserRoleBody>, res: Response) => {
    const { id, isEnrolled } = req.body
    if (!id) {
      throw new ApiError(400, ERROR_MESSAGE.generalError)
    }

    const userExist = await helperService.verifyUser(id)
    if (!userExist) {
      throw new ApiError(404, ERROR_MESSAGE.userNotFound)
    }

    const roleUpdateStatus = await userService.updateUserRole(id, isEnrolled)
    if (!roleUpdateStatus) {
      throw new ApiError(500, ERROR_MESSAGE.enrollmentFailure)
    }

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          roleUpdateStatus,
          SUCCESS_MESSAGE.enrollmentSuccess,
        ),
      )
  },
)
