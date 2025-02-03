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
import { ApiReponse } from '../utils/ApiResponse'
import helperService from '../services/helperService'
import {
  LoginUserBody,
  RegisterUserBody,
  UpdateUserRoleBody,
  ValidateUsernameAndEmailBody,
} from '../interfaces/userInterface'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '../utils/message'

export const verifyEmailAndUserName = asyncHandler(
  async (req: Request<{}, {}, ValidateUsernameAndEmailBody>, res: Response) => {
    try {
      const { username, email, password, phoneNumber } = req.body

      // User field validation
      if (!EMAIL_REGEX.test(email)) {
        return res
          .status(400)
          .json(new ApiError(400, ERROR_MESSAGE.invalidEmail))
      }

      if (!USERNAME_REGEX.test(username)) {
        return res
          .status(400)
          .json(new ApiError(400, ERROR_MESSAGE.invalidUsername))
      }

      if (!PASSWORD_REGEX.test(password)) {
        return res
          .status(400)
          .json(new ApiError(400, ERROR_MESSAGE.invalidPassword))
      }

      // Validate duplicate user email address
      const duplicateEmail = await helperService.validateUserEmail(email)
      if (duplicateEmail) {
        return res
          .status(400)
          .json(new ApiError(400, ERROR_MESSAGE.duplicateEmail))
      }

      // Validate duplicate username
      const duplicateUsername = await helperService.validateUsername(username)
      if (duplicateUsername) {
        return res
          .status(400)
          .json(new ApiError(400, ERROR_MESSAGE.duplicateUsername))
      }

      // Validate duplicate phonenumber
      const duplicatePhoneNumber =
        await helperService.validatePhoneNumber(phoneNumber)
      if (duplicatePhoneNumber) {
        return res
          .status(400)
          .json(new ApiError(400, ERROR_MESSAGE.duplicatePhoneNumber))
      }

      const phoneNumberOTP = await generateOTP()
      const emailOTP = await generateOTP()

      const storeEmailOTPResponse = await helperService.storeOTP(
        phoneNumberOTP,
        phoneNumber,
        'phoneNumber',
        'registration',
        otpExpireAfter(),
      )
      const storePhoneOTPResponse = await helperService.storeOTP(
        emailOTP,
        email,
        'email',
        'registration',
        otpExpireAfter(),
      )
      // TODO: Function call to send OTP to user email via sendgrid
      return res
        .status(200)
        .json(
          new ApiReponse(200, { otpStatus: true }, SUCCESS_MESSAGE.OTPSuccess),
        )
    } catch (err: any) {
      return res
        .status(500)
        .json(new ApiError(500, ERROR_MESSAGE.generalError, err))
    }
  },
)

// export const verifyPhoneNumber = asyncHandler(
//   async (req: Request<{}, {}, { phoneNumber: string }>, res: Response) => {
//     try {
//       const { phoneNumber } = req.body

//       // Validate duplicate phonenumber
//       const duplicatePhoneNumber =
//         await helperService.validatePhoneNumber(phoneNumber)
//       if (duplicatePhoneNumber) {
//         return res
//           .status(400)
//           .json(new ApiError(400, ERROR_MESSAGE.duplicatePhoneNumber))
//       }

//       const phoneNumberOTP = await generateOTP()
//       const storeOTPResponse = await helperService.storeOTP(
//         phoneNumberOTP,
//         phoneNumber,
//         'phoneNumber',
//         'registration',
//         otpExpireAfter(),
//       )
//       // TODO: Function call to send OTP to user message via sendgrid
//       return res
//         .status(200)
//         .json(new ApiReponse(200, {}, SUCCESS_MESSAGE.phoneOTPSuccess))
//     } catch (err: any) {
//       return res
//         .status(500)
//         .json(new ApiError(500, ERROR_MESSAGE.generalError, err))
//     }
//   },
// )

export const verifyOTP = asyncHandler(
  async (req: Request<{}, {}, { key: string; otp: string }>, res: Response) => {
    try {
      const { key, otp } = req.body

      const OTPStatus = await helperService.verifyOTP(key)
      console.log({ OTPStatus })
      if (OTPStatus?.otp === otp) {
        const deleteOTPResponse = await helperService.deleteVerifiedOTP(key, otp)
        return res
          .status(200)
          .json(
            new ApiReponse(
              200,
              { otpStatus: true },
              SUCCESS_MESSAGE.otpVerified,
            ),
          )
      } else {
        // TODO: Function call to send OTP to user message via sendgrid
        return res
          .status(200)
          .json(
            new ApiReponse(400, { otpStatus: false }, ERROR_MESSAGE.invalidOTP),
          )
      }
    } catch (err: any) {
      return res
        .status(500)
        .json(new ApiError(500, ERROR_MESSAGE.generalError, err))
    }
  },
)

export const registerUser = asyncHandler(
  async (req: Request<{}, {}, RegisterUserBody>, res: Response) => {
    try {
      const data = req.body
      const { accessToken, refreshToken } = await generateTokens({
        email: data.email,
      })
      data.token = accessToken
      data.refreshToken = refreshToken
      data.password = await bcrypt.hash(data.password, BECRYPT_SALT_VALUE)
      const user = await userService.registerUser(data)
      return res
        .status(201)
        .json(new ApiReponse(200, user, SUCCESS_MESSAGE.registerSuccess))
    } catch (err: any) {
      return res
        .status(500)
        .json(new ApiError(500, ERROR_MESSAGE.registrationFailure, err))
    }
  },
)

export const loginUser = asyncHandler(
  async (req: Request<{}, {}, LoginUserBody>, res: Response) => {
    try {
      const { email, password } = req.body

      if (!EMAIL_REGEX.test(email)) {
        return res
          .status(400)
          .json(new ApiError(400, ERROR_MESSAGE.invalidEmail))
      }
      const userExist = await helperService.verifyUserEmail(email)
      if (!userExist) {
        return res
          .status(404)
          .json(new ApiError(404, ERROR_MESSAGE.userEmailFound))
      }

      const isPasswordValid = await bcrypt.compare(password, userExist.password)
      if (!isPasswordValid || !PASSWORD_REGEX.test(password)) {
        return res
          .status(401)
          .json(new ApiError(401, ERROR_MESSAGE.invalidPassword))
      }

      const { accessToken, refreshToken } = await generateTokens({ email })
      const userResponse = await userService.loginUser(
        email,
        accessToken,
        refreshToken,
      )

      return res
        .status(200)
        .json(new ApiReponse(200, userResponse, SUCCESS_MESSAGE.loginSuccess))
    } catch (err: any) {
      return res
        .status(500)
        .json(new ApiError(500, ERROR_MESSAGE.loginFailure, err))
    }
  },
)

export const getUsers = async (req: Request, res: Response) => {
  try {
    const users = await userService.getAllUsers()
    res.status(200).json(users)
  } catch (err: any) {
    return res
      .status(500)
      .json(new ApiError(500, ERROR_MESSAGE.generalError, err))
  }
}

export const updateUserRole = asyncHandler(
  async (req: Request<{}, {}, UpdateUserRoleBody>, res: Response) => {
    try {
      const { id, isEnrolled } = req.body
      if (!id) {
        return res
          .status(400)
          .json(new ApiError(400, ERROR_MESSAGE.generalError))
      }

      const userExist = await helperService.verifyUser(id)
      if (!userExist) {
        return res
          .status(404)
          .json(new ApiError(404, ERROR_MESSAGE.userNotFound))
      }

      const roleUpdateStatus = await userService.updateUserRole(id, isEnrolled)
      console.log(roleUpdateStatus);
      
      if (!roleUpdateStatus) {
        return res
          .status(500)
          .json(new ApiError(500, ERROR_MESSAGE.enrollmentFailure))
      }

      return res
        .status(200)
        .json(
          new ApiReponse(
            200,
            roleUpdateStatus,
            SUCCESS_MESSAGE.enrollmentSuccess,
          ),
        )
    } catch (err: any) {
      return res
        .status(500)
        .json(new ApiError(500, ERROR_MESSAGE.generalError, err))
    }
  },
)

// DELETE ALL USERS
export const deleteAllUsers = asyncHandler(
  async (req: Request, res: Response) => {
    try {
      const response = await userService.deleteAllUser()
      return res
        .status(200)
        .json(new ApiReponse(200, response, 'All users deleted'))
    } catch (err: any) {
      return res
        .status(500)
        .json(new ApiError(500, 'Failed to delete all users', err))
    }
  },
)
