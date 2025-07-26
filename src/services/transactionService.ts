import prisma from '../prisma/client'

const getMyTransactions = async (userId: string) => {
  return await prisma.transaction.findMany({
    where: {
      userId: userId,
    },
    include: {
      transactionItems: true, // Assuming you have a service relation
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

const storeTransaction = async (
  userId: string,
  cartItems: any,
  paymentDetails: {
    amount: string
    tax: string
    totalAmount: string
    transactionType: string
    paymentId: string
    paymentStatus: string
  },
) => {
  const { tax, totalAmount, transactionType, paymentId, paymentStatus } =
    paymentDetails

  const transaction = await prisma.transaction.create({
    data: {
      userId,
      paymentId,
      transactionType,
      paymentStatus,
      totalAmount: parseFloat(totalAmount),
      tax: parseFloat(tax),
      transactionItems: {
        create: cartItems.map((item: any) => ({
          serviceId: item.serviceId,
          serviceTitle: item.title,
          servicePrice: item.pricing,
          serviceProviderId: item.userId,
          venue: item.venue,
          meetingUrl: item.meetingUrl,
          address: item.addressInfo.address,
          city: item.addressInfo.city,
          postalCode: item.addressInfo.postalCode,
          state: item.addressInfo.state,
          country: item.addressInfo.country,
          schedules: {
            create: item.schedule.map((s: any) => ({
              scheduleId: s.id,
              date: new Date(s.date),
            })),
          },
        })),
      },
    },
    include: {
      transactionItems: {
        include: {
          schedules: true,
        },
      },
    },
  })

  console.log('Transaction created:', transaction)
  return transaction
}

export default {
  storeTransaction,
  getMyTransactions,
}
