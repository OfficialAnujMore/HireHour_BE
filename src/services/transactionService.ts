import prisma from '../prisma/client'
import {
  GetTransactionsRequest,
  TransactionSummary,
  TransactionFilterRequest,
  CreateTransactionRequest,
  InvoiceRequest,
  RefundRequest,
  TransactionAnalyticsRequest,
  ExportTransactionsRequest,
} from '../interfaces/transactionInterface'

const getMyTransactions = async (data: GetTransactionsRequest) => {
  const { userId, type, limit, offset, startDate, endDate } = data

  const whereClause: any = {
    userId: userId,
  }

  // Add status filter
  if (type && type !== 'all') {
    whereClause.paymentStatus = type
  }

  // Add date range filter
  if (startDate || endDate) {
    whereClause.createdAt = {}
    if (startDate) whereClause.createdAt.gte = new Date(startDate)
    if (endDate) whereClause.createdAt.lte = new Date(endDate)
  }

  return await prisma.transaction.findMany({
    where: whereClause,
    include: {
      transactionItems: {
        include: {
          schedules: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: limit || 50,
    skip: offset || 0,
  })
}

const storeTransaction = async (data: CreateTransactionRequest) => {
  const { userId, cartItems, paymentDetails } = data
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
        create: cartItems.map((item) => ({
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

const getTransactionSummary = async (userId: string): Promise<TransactionSummary> => {
  const transactions = await prisma.transaction.findMany({
    where: { userId },
    select: {
      paymentStatus: true,
      totalAmount: true,
    },
  })

  const totalTransactions = transactions.length
  const totalAmount = transactions.reduce((sum, t) => sum + Number(t.totalAmount), 0)
  const completedTransactions = transactions.filter(t => t.paymentStatus === 'completed').length
  const pendingTransactions = transactions.filter(t => t.paymentStatus === 'pending').length
  const cancelledTransactions = transactions.filter(t => t.paymentStatus === 'cancelled').length
  const averageTransactionValue = totalTransactions > 0 ? totalAmount / totalTransactions : 0

  return {
    totalTransactions,
    totalAmount,
    completedTransactions,
    pendingTransactions,
    cancelledTransactions,
    averageTransactionValue,
  }
}

const filterTransactions = async (data: TransactionFilterRequest) => {
  const { userId, status, startDate, endDate, minAmount, maxAmount, serviceId } = data

  const whereClause: any = {
    userId,
  }

  if (status) whereClause.paymentStatus = status
  if (serviceId) whereClause.serviceId = serviceId

  if (startDate || endDate) {
    whereClause.createdAt = {}
    if (startDate) whereClause.createdAt.gte = new Date(startDate)
    if (endDate) whereClause.createdAt.lte = new Date(endDate)
  }

  if (minAmount || maxAmount) {
    whereClause.totalAmount = {}
    if (minAmount) whereClause.totalAmount.gte = minAmount
    if (maxAmount) whereClause.totalAmount.lte = maxAmount
  }

  return await prisma.transaction.findMany({
    where: whereClause,
    include: {
      transactionItems: {
        include: {
          schedules: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })
}

const generateInvoice = async (data: InvoiceRequest) => {
  const { transactionId, userId, format = 'pdf' } = data

  // Verify transaction exists and belongs to user
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
    include: {
      transactionItems: true,
    },
  })

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  // Generate invoice logic here
  // This would typically involve a PDF generation service
  const invoiceUrl = `/invoices/${transactionId}.${format}`

  return { invoiceUrl }
}

const processRefund = async (data: RefundRequest) => {
  const { transactionId, userId, reason, amount } = data

  // Verify transaction exists and belongs to user
  const transaction = await prisma.transaction.findFirst({
    where: {
      id: transactionId,
      userId,
    },
  })

  if (!transaction) {
    throw new Error('Transaction not found')
  }

  // Process refund logic here
  // This would typically involve payment gateway integration
  const refundAmount = amount ? parseFloat(amount) : transaction.totalAmount

  const updatedTransaction = await prisma.transaction.update({
    where: { id: transactionId },
    data: {
      paymentStatus: 'refunded',
    },
    include: {
      transactionItems: true,
    },
  })

  return updatedTransaction
}

export default {
  storeTransaction,
  getMyTransactions,
  getTransactionSummary,
  filterTransactions,
  generateInvoice,
  processRefund,
}
