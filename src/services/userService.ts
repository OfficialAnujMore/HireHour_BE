import prisma from '../prisma/client'
import { CREATE_PREVIEW, UPDATE_PREVIEW } from '../utils/ApiResponseConstants'

const registerUser = async (data: any) => {
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

export default {
  registerUser,
  loginUser,
  updateUserRole,
  validateUserRole,
  upsertFCMToken
}
