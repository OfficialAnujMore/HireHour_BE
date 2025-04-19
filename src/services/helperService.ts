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
  return await prisma.otp.create({
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
  return await prisma.otp.findFirst({
    where: {
      key: key,
    },
    select: {
      otp: true,
    },
  })
}
const deleteVerifiedOTP = async (key: string, otp: string) => {
  return await prisma.otp.deleteMany({
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

const existingService = async (id: string) => {
  return await prisma.services.findFirst({
    where: {
      AND: [{ id: id }, { isDisabled: false }, { deletedAt: null }],
    },
  })
}

const verifyUserRole = async (id: string) => {
  return await prisma.user.findFirst({
    where: {
      AND: [
        { id: id },
        { isDisabled: false },
        { deletedAt: null },
        { isServiceProvider: true },
      ],
    },
    select: CREATE_PREVIEW,
  })
}

const getUserFCMToken = async (id: string) => {
  return await prisma.user.findFirst({
    where: {
      AND: { id: id },
    },
  })
}

const verifyScheduleAvailability = async (
  schedule: {
    id: string
    servicesId: string
    date: string
    selected: boolean
    isAvailable: boolean
  }[],
) => {
  const responsePromise = schedule.map((scheduleItem) =>
    prisma.schedule.findMany({
      where: {
        AND: [
          { id: scheduleItem.id },
          {
            isAvailable: false,
          },
        ],
      },
    }),
  )
  const nestedResult = await Promise.all(responsePromise)
  const flatResult = nestedResult.flat() // flatten the arrays
  return flatResult;
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
  existingService,
  verifyUserRole,
  getUserFCMToken,
  verifyScheduleAvailability,
}
