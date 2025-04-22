import prisma from '../prisma/client'

const createPaymentTransaction = async (data: any) => {
  return await prisma.transaction.create({
    data: data,
  })
}

const getMyTransactions = async (userId: string) => {
  const transaction = await prisma.transaction.findMany({
    where: {
      userId: userId,
    },
    include: {
      service:true,
    },
  })

  // Shape the result to match the desired structure
  return transaction;
}

export default {
  createPaymentTransaction,
  getMyTransactions
}
