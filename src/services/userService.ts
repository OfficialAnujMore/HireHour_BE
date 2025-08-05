import prisma from '../prisma/client'
import { CREATE_PREVIEW, UPDATE_PREVIEW } from '../utils/ApiResponseConstants'
import { RegisterUserBody } from '../interfaces/userInterface'

const registerUser = async (data: RegisterUserBody) => {
  return await prisma.user.create({
    data,
    select: CREATE_PREVIEW,
  })
}

const loginUser = async (
  email: string,
  accessToken: string,
  refreshToken: string,
) => {
  return await prisma.user.update({
    where: {
      email: email,
    },
    data: {
      token: accessToken,
      refreshToken: refreshToken,
      lastLogin: new Date(),
    },
    select: CREATE_PREVIEW,
  })
}

const updateUserRole = async (id: string, isEnrolled: boolean) => {
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: {
      isServiceProvider: isEnrolled,
    },
    select: UPDATE_PREVIEW,
  })
}

const validateUserRole = async (id: string, isServiceProvider: boolean) => {
  return await prisma.user.findFirst({
    where: {
      AND: [{ id }, { isServiceProvider }],
    },
    select: UPDATE_PREVIEW,
  })
}

const upsertFCMToken = async (userId: string, fcmToken: string) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      fcmToken: fcmToken,
    },
    select: UPDATE_PREVIEW,
  })
}

const updateUserDetails = async (data: any) => {
  const { id, ...updateData } = data
  return await prisma.user.update({
    where: {
      id: id,
    },
    data: updateData,
    select: UPDATE_PREVIEW,
  })
}

const validateExistingUser = async (data: any) => {
  const { email, username, phoneNumber } = data
  const result = {
    emailExists: false,
    usernameExists: false,
    phoneNumberExists: false,
  }

  if (email) {
    const emailUser = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    })
    result.emailExists = !!emailUser
  }

  if (username) {
    const usernameUser = await prisma.user.findFirst({
      where: { username },
      select: { id: true },
    })
    result.usernameExists = !!usernameUser
  }

  if (phoneNumber) {
    const phoneUser = await prisma.user.findFirst({
      where: { phoneNumber },
      select: { id: true },
    })
    result.phoneNumberExists = !!phoneUser
  }

  return result
}

const updateUserPassword = async (userId: string, hashedPassword: string) => {
  return await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      password: hashedPassword,
    },
    select: UPDATE_PREVIEW,
  })
}

export default {
  registerUser,
  loginUser,
  updateUserRole,
  validateUserRole,
  upsertFCMToken,
  updateUserDetails,
  validateExistingUser,
  updateUserPassword,
}
