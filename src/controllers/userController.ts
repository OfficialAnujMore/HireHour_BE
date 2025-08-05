import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import userService from '../services/userService'
import {
  BECRYPT_SALT_VALUE,
  EMAIL_REGEX,
  PASSWORD_REGEX,
  USERNAME_REGEX,
} from '../constants'
import {
  generateOTP,
  generateTokens,
  initializePushNotification,
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
  UpsterFCMToken,
  ValidatePhoneNumber,
  ValidateUsernameAndEmailBody,
  UpdateUserDetailsBody,
  ValidateExistingUserBody,
  ForgetEmailBody,
  ForgetUsernameBody,
  ForgetPasswordBody,
  ResetPasswordBody,
} from '../interfaces/userInterface'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '../utils/message'
import { FCM_MESSAGE } from '../utils/fcmMessage'
import { sendTemplatedEmail } from '../utils/emailService'

export const verifyEmailAndUsername = asyncHandler(
  async (req: Request<{}, {}, ValidateUsernameAndEmailBody>, res: Response) => {
    const { firstName, username, email, password } = req.body

    if (!EMAIL_REGEX.test(email)) {
      throw new ApiError(400, ERROR_MESSAGE.invalidEmail)
    }

    if (!USERNAME_REGEX.test(username)) {
      throw new ApiError(400, ERROR_MESSAGE.invalidUsername)
    }

    if (!PASSWORD_REGEX.test(password)) {
      throw new ApiError(400, ERROR_MESSAGE.invalidPassword)
    }

    const duplicateEmail = await helperService.verifyEmail(email)
    if (duplicateEmail) {
      throw new ApiError(400, ERROR_MESSAGE.duplicateEmail)
    }

    const duplicateUsername = await helperService.verifyUsername(username)
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

    await sendTemplatedEmail({
      to: email,
      templateId: process.env.OTP_VERIFICATION_TEMPLATE_ID || '', // Replace with your actual template ID
      dynamicTemplateData: {
        name: firstName,
        otp: emailOTP,
        year: new Date().getFullYear(),
      },
    })

    return res
      .status(200)
      .json(
        new ApiResponse(200, { otpStatus: true }, SUCCESS_MESSAGE.otpSuccess),
      )
  },
)

export const verifyPhoneNumber = asyncHandler(
  async (req: Request<{}, {}, ValidatePhoneNumber>, res: Response) => {
    const { phoneNumber } = req.body

    const duplicatePhoneNumber =
      await helperService.verifyPhoneNumber(phoneNumber)
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
        new ApiResponse(200, { otpStatus: true }, SUCCESS_MESSAGE.otpSuccess),
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
    
    // Validate password format
    if (!PASSWORD_REGEX.test(data.password)) {
      throw new ApiError(400, ERROR_MESSAGE.invalidPassword)
    }
    
    const { accessToken, refreshToken } = await generateTokens({
      email: data.email,
    })
    data.token = accessToken
    data.refreshToken = refreshToken
    data.password = await bcrypt.hash(data.password, BECRYPT_SALT_VALUE)

    const user = await userService.registerUser(data)
    console.log('User data after registration', user);

    if (!user) {
      throw new ApiError(500, ERROR_MESSAGE.registrationFailure)
    }

    await sendTemplatedEmail({
      to: data.email,
      templateId: process.env.WELCOME_TEMPLATE_ID || '', // Replace with your actual template ID
      dynamicTemplateData: {
        name: data.firstName,
        year: new Date().getFullYear(),
      },
    })

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

    const userExist = await helperService.verifyEmail(email)
    if (!userExist) {
      throw new ApiError(404, ERROR_MESSAGE.userEmailFound)
    }

    const isPasswordValid = await bcrypt.compare(password, userExist.password)
    if (!isPasswordValid) {
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

    const userExist = await helperService.verifyExistingUser(id)
    if (!userExist) {
      throw new ApiError(404, ERROR_MESSAGE.userNotFound)
    }

    const roleUpdateStatus = await userService.updateUserRole(id, isEnrolled)
    if (!roleUpdateStatus) {
      throw new ApiError(500, ERROR_MESSAGE.enrollmentFailure)
    }
    const fcmResponse = await helperService.getUserFCMToken(id)

    if (fcmResponse?.fcmToken) {
      const body = {
        token: fcmResponse.fcmToken,
        title: FCM_MESSAGE.serviceProviderEnrollment.title,
        body: FCM_MESSAGE.serviceProviderEnrollment.body,
      }
      initializePushNotification(body)
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

export const forgetEmail = asyncHandler(
  async (req: Request<{}, {}, { phoneNumber: string }>, res: Response) => {
    const { phoneNumber } = req.body

    // Check if phone number exists
    const user = await helperService.verifyPhoneNumber(phoneNumber)
    if (!user) {
      throw new ApiError(404, ERROR_MESSAGE.userNotFound)
    }

    const emailOTP = await generateOTP()
    const storeEmailOTPResponse = await helperService.storeOTP(
      emailOTP,
      phoneNumber,
      'phoneNumber',
      'forgetEmail',
      otpExpireAfter(),
    )

    if (!storeEmailOTPResponse) {
      throw new ApiError(500, ERROR_MESSAGE.otpGenerationFailed)
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { otpStatus: true }, SUCCESS_MESSAGE.otpSuccess),
      )
  },
)

export const forgetUsername = asyncHandler(
  async (req: Request<{}, {}, { email: string }>, res: Response) => {
    const { email } = req.body

    // Check if the user exists with the provided email
    const user = await helperService.verifyEmail(email)
    if (!user) {
      throw new ApiError(404, ERROR_MESSAGE.userNotFound)
    }

    const usernameOTP = await generateOTP()
    const storeUsernameOTPResponse = await helperService.storeOTP(
      usernameOTP,
      email,
      'email',
      'forgetUsername',
      otpExpireAfter(),
    )

    if (!storeUsernameOTPResponse) {
      throw new ApiError(500, ERROR_MESSAGE.otpGenerationFailed)
    }

    return res
      .status(200)
      .json(
        new ApiResponse(200, { otpStatus: true }, SUCCESS_MESSAGE.otpSuccess),
      )
  },
)

export const forgetPassword = asyncHandler(
  async (req: Request<{}, {}, { email: string }>, res: Response) => {
    const { email } = req.body

    // Check if the email exists
    const user = await helperService.verifyEmail(email)
    if (!user) {
      throw new ApiError(404, ERROR_MESSAGE.userNotFound)
    }

    const passwordOTP = await generateOTP()
    console.log(`Generated OTP for ${email}: ${passwordOTP}`) // Temporary logging for testing
    const storePasswordOTPResponse = await helperService.storeOTP(
      passwordOTP,
      email,
      'email',
      'forgetPassword',
      otpExpireAfter(),
    )

    if (!storePasswordOTPResponse) {
      throw new ApiError(500, ERROR_MESSAGE.otpGenerationFailed)
    }

    // Send password reset email
    await sendTemplatedEmail({
      to: email,
      templateId: process.env.PASSWORD_RESET_TEMPLATE_ID || '', // Replace with your actual template ID
      dynamicTemplateData: {
        name: user.firstName,
        otp: passwordOTP,
        year: new Date().getFullYear(),
      },
    })

    return res
      .status(200)
      .json(
        new ApiResponse(200, { otpStatus: true }, SUCCESS_MESSAGE.otpSuccess),
      )
  },
)

export const resetPassword = asyncHandler(
  async (req: Request<{}, {}, ResetPasswordBody>, res: Response) => {
    const { email, otp, newPassword } = req.body

    // Validate email format
    if (!EMAIL_REGEX.test(email)) {
      throw new ApiError(400, ERROR_MESSAGE.invalidEmail)
    }

    // Validate password format
    if (!PASSWORD_REGEX.test(newPassword)) {
      throw new ApiError(400, ERROR_MESSAGE.invalidPassword)
    }

    // Check if the user exists
    const user = await helperService.verifyEmail(email)
    if (!user) {
      throw new ApiError(404, ERROR_MESSAGE.userNotFound)
    }

    // Verify OTP
    const storedOTP = await helperService.verifyOTP(email)
    if (!storedOTP || storedOTP.otp !== otp) {
      throw new ApiError(400, ERROR_MESSAGE.invalidOTP)
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, BECRYPT_SALT_VALUE)

    // Update the user's password
    const updatedUser = await userService.updateUserPassword(user.id, hashedPassword)
    if (!updatedUser) {
      throw new ApiError(500, ERROR_MESSAGE.updateFailure)
    }

    // Delete the used OTP
    await helperService.deleteVerifiedOTP(email, otp)

    return res
      .status(200)
      .json(
        new ApiResponse(200, { success: true }, SUCCESS_MESSAGE.passwordResetSuccess),
      )
  },
)

export const upsertFCMToken = asyncHandler(
  async (req: Request<{}, {}, UpsterFCMToken>, res: Response) => {
    const { userId, fcmToken } = req.body
    if (!userId) {
      throw new ApiError(400, ERROR_MESSAGE.generalError)
    }

    const userExist = await helperService.verifyExistingUser(userId)
    if (!userExist) {
      throw new ApiError(404, ERROR_MESSAGE.userNotFound)
    }
    const response = await userService.upsertFCMToken(userId, fcmToken)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.fcmTokenFailure)
    }

    return res.status(200).json(new ApiResponse(200, response, ''))
  },
)

export const updateUserDetails = asyncHandler(
  async (req: Request<{}, {}, UpdateUserDetailsBody>, res: Response) => {
    const data = req.body
    if (!data.id) {
      throw new ApiError(400, ERROR_MESSAGE.generalError)
    }

    const userExist = await helperService.verifyExistingUser(data.id)
    if (!userExist) {
      throw new ApiError(404, ERROR_MESSAGE.userNotFound)
    }

    const response = await userService.updateUserDetails(data)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.updateFailure)
    }

    return res.status(200).json(new ApiResponse(200, response, SUCCESS_MESSAGE.updateSuccess))
  },
)

export const validateExistingUser = asyncHandler(
  async (req: Request<{}, {}, ValidateExistingUserBody>, res: Response) => {
    const data = req.body
    const { email, username, phoneNumber } = data

    if (!email && !username && !phoneNumber) {
      throw new ApiError(400, ERROR_MESSAGE.generalError)
    }

    const response = await userService.validateExistingUser(data)
    return res.status(200).json(new ApiResponse(200, response, SUCCESS_MESSAGE.validationSuccess))
  },
)
