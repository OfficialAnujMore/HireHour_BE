import prisma from '../prisma/client'
import { USER_PREVIEW_BODY } from '../utils/constants'

// HELPER FUNCTIONS
const verifyUserEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where: {
      email,
    },
  })
}

const validateUserEmail = async (email: string) => {
  return await prisma.user.findFirst({
    where: {
      email,
    },
    select: USER_PREVIEW_BODY,
  })
}
const validateUsername = async (username: string) => {
  return await prisma.user.findFirst({
    where: {
      username: username,
    },
    select: USER_PREVIEW_BODY,
  })
}

const validatePhoneNumber = async (phoneNumber: string) => {
  return await prisma.user.findFirst({
    where: {
      phoneNumber: phoneNumber,
    },
    select: USER_PREVIEW_BODY,
  })
}

const storeOTP = async (
  otp: any,
  key: string,
  field: string,
  type: string,
  expireAfter: Date,
) => {
  return await prisma.oTP.create({
    data: {
      otp,
      key,
      field,
      type,
      expireAfter,
    },
  })
}

const verifyOTP = async (key: string) => {
  return await prisma.oTP.findFirst({
    where: {
      key: key,
    },
    select: {
      otp: true,
    },
  })
}
const deleteVerifiedOTP = async (key: string, otp: string) => {
  return await prisma.oTP.deleteMany({
    where: {
      key: key,
    },
  })
}

const verifyUser = async (id: string) => {
  return await prisma.user.findFirst({
    where: {
      AND: [{ id: id }, { isDisabled: false }, { deletedAt: null }],
    },
    select: USER_PREVIEW_BODY,
  })
}

export default {
  validateUserEmail,
  validateUsername,
  validatePhoneNumber,
  verifyUserEmail,
  verifyUser,
  storeOTP,
  verifyOTP,
  deleteVerifiedOTP
}
