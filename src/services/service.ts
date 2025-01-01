import { Services } from "@prisma/client";
import prisma from "../prisma/client";

const createUserService = async (userService: Services) => {
    return await prisma.services.create({
      data: userService
    })
  }

const getUserServices = async (id: string) => {
    return await prisma.services.findMany({
        where: {
            AND: [
                { userId: id },
                { isDeleted: false },
                { isDisabled: false }
            ]
        }
    });
};

export default {getUserServices, createUserService}