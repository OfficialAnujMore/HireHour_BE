import prisma from "../prisma/client";
import { USER_PREVIEW_BODY } from "../utils/constants";

// HELPER FUNCTIONS
const verifyUserEmail = async (email: string) => {
    return await prisma.user.findUnique({
        where:
            { email }
    });
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
                { isDisabled: false },
                { isDeleted: false }
            ]
        },
        select: USER_PREVIEW_BODY
    })
}

export default { validateDuplicateUser, verifyUserEmail, verifyUser }
