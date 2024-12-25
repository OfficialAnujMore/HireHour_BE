import prisma from '../prisma/client';

const getAllUsers = async () => {
  return await prisma.user.findMany();
};

const createUser = async (name: string, email: string) => {
  return await prisma.user.create({
    data: {
      name,
      email,
    }
  });
};

export default { getAllUsers, createUser };
