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

const validateDuplicateUser = async (email: string, username: string) => {
  return await prisma.user.findFirst({
    where: {
      OR: [
        { email: email },
        { username: username }
      ]
    }

  })
}

const deleteAllUser = async ()=>{
  return await prisma.user.deleteMany();
}

export default { getAllUsers, registerUser, validateDuplicateUser,deleteAllUser };
