import prisma from '../prisma/client'
import { CREATE_PREVIEW } from '../utils/ApiResponseConstants'

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
    select: CREATE_PREVIEW,
  })
}
const validateUsername = async (username: string) => {
  return await prisma.user.findFirst({
    where: {
      username: username,
    },
    select: CREATE_PREVIEW,
  })
}

const validatePhoneNumber = async (phoneNumber: string) => {
  return await prisma.user.findFirst({
    where: {
      phoneNumber: phoneNumber,
    },
    select: CREATE_PREVIEW,
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
    select: CREATE_PREVIEW,
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
  deleteVerifiedOTP,
}
