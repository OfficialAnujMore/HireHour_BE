import { Schedule } from './serviceInterface'

interface User {
  id: string
  firstName: string
  lastName: string
  email: string
  username: string
  phoneNumber: string
  password: string
  isServiceProvider: boolean
  avatarUri?: string
  profileImageURL?: string
  bannerImageURL?: string
  token?: string
  refreshToken?: string
  fcmToken?: string
  lastLogin: Date
  deletedAt?: Date
  isDisabled: boolean
  createdAt: Date
  updatedAt: Date
  userPreference?: string[]
  schedule?: Schedule[]
}

interface RegisterUserBody {
  firstName: string
  lastName: string
  email: string
  username: string
  phoneNumber: string
  password: string
  token: string
  refreshToken: string
}

interface ValidateUsernameAndEmailBody {
  firstName: string
  email: string
  password: string
  username: string
}

interface ValidatePhoneNumber {
  phoneNumber: string
}

interface LoginUserBody {
  email: string
  password: string
}

interface UpdateUserRoleBody {
  id: string
  isEnrolled: boolean
}

interface UpsterFCMToken {
  userId: string
  fcmToken: string
}

interface UpdateUserDetailsBody {
  id: string
  firstName?: string
  lastName?: string
  phoneNumber?: string
  avatarUri?: string
  profileImageURL?: string
  bannerImageURL?: string
}

interface ValidateExistingUserBody {
  email?: string
  username?: string
  phoneNumber?: string
}

interface ForgetEmailBody {
  phoneNumber: string
}

interface ForgetUsernameBody {
  email: string
}

interface ForgetPasswordBody {
  email: string
}

interface ResetPasswordBody {
  email: string
  otp: string
  newPassword: string
}

interface FCMSendMessageParams {
  token: string
  title: string
  body: string
}

export {
  User,
  ValidateUsernameAndEmailBody,
  ValidatePhoneNumber,
  RegisterUserBody,
  LoginUserBody,
  UpdateUserRoleBody,
  UpsterFCMToken,
  UpdateUserDetailsBody,
  ValidateExistingUserBody,
  ForgetEmailBody,
  ForgetUsernameBody,
  ForgetPasswordBody,
  ResetPasswordBody,
  FCMSendMessageParams,
}
