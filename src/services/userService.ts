import { Role, Services } from '@prisma/client';
import prisma from '../prisma/client';
import { USER_PREVIEW_BODY } from '../utils/constants';

const registerUser = async (data: any) => {
  return await prisma.user.create({
    data,
    select: USER_PREVIEW_BODY,
  });
};

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

const getAllUsers = async () => {
  return await prisma.user.findMany({
    select: USER_PREVIEW_BODY,
  });
};

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

const deleteAllUser = async () => {
  await prisma.services.deleteMany();
  return await prisma.user.deleteMany();
}

export default { getAllUsers, registerUser, deleteAllUser, loginUser, updateUserRole, validateUserRole };
