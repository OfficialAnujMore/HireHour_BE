import { Role, Services } from '@prisma/client';
import prisma from '../prisma/client';
import { USER_PREVIEW_BODY } from '../utils/constants';

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: USER_PREVIEW_BODY,
  });
};

const registerUser = async (data: any) => {
  return await prisma.user.create({
    data,
    select: USER_PREVIEW_BODY,
  });
};

const verifyUserEmail = async (email: string) => {
  return await prisma.user.findUnique({
    where:
      { email }
  });
}
const loginUser = async (email: string, accessToken: string, refreshToken: string) => {

  return await prisma.user.update({
    where: {
      email: email,
    },

    data: {
      token: accessToken,
      refreshToken: refreshToken,
      lastLogin: new Date()
    },
    select: USER_PREVIEW_BODY

  })
}


const updateUserRole = async (id: string, userRole: Role) => {
  return await prisma.user.update({
    where: {
      id: id
    },
    data: {
      userRole: userRole
    },
    select: USER_PREVIEW_BODY
  })
}

const validateUserRole = async (id: string, userRole: Role) => {
  return await prisma.user.findFirst({
    where: {
      AND: [
        { id: id },
        { userRole: Role.CUSTOMER }
      ]
    },
    select: USER_PREVIEW_BODY
  })
}

const validateDuplicateUser = async (email: string, username: string) => {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { email: email },
        { username: username }
      ]
    },
    select: USER_PREVIEW_BODY

  })
}


const verifyUser = async (id: string) => {
  return await prisma.user.findFirst({
    where: {
      AND: [
        { id: id },
        { isDisabled: false }
      ]
    },
    select: USER_PREVIEW_BODY

  })
}

const createUserService = async (userService: Services) => {
  return await prisma.services.create({
    data: userService
  })
}

const deleteAllUser = async () => {
  return await prisma.user.deleteMany();
}

export default { getAllUsers, registerUser, validateDuplicateUser, verifyUserEmail, deleteAllUser, loginUser, verifyUser, updateUserRole, validateUserRole,createUserService };
