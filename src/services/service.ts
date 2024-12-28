import prisma from "../prisma/client";

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

export default {getUserServices}