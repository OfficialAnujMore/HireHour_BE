import { Request, Response } from 'express'
import transaction from '../services/transactionService'
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'
import {
  GetTransactionsRequest,
  CreateTransactionRequest,
  TransactionFilterRequest,
  InvoiceRequest,
  RefundRequest,
  TransactionAnalyticsRequest,
  ExportTransactionsRequest,
} from '../interfaces/transactionInterface'
import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '../utils/message'

// Controller to get all the user transaction
export const getMyTransactions = asyncHandler(
  async (req: Request<{}, {}, GetTransactionsRequest>, res: Response) => {
    const data = req.body
    
    if (!data.userId) {
      throw new ApiError(400, 'User ID is required')
    }
    
    const response = await transaction.getMyTransactions(data)    
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }    
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response,
          'User transaction retrieved successfully',
        ),
      )
  },
)

// Controller to create a new transaction
export const createTransaction = asyncHandler(
  async (req: Request<{}, {}, CreateTransactionRequest>, res: Response) => {
    const data = req.body
    
    if (!data.userId || !data.cartItems || !data.paymentDetails) {
      throw new ApiError(400, 'User ID, cart items, and payment details are required')
    }
    
    const response = await transaction.storeTransaction(data)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    
    return res
      .status(201)
      .json(
        new ApiResponse(
          201,
          response,
          'Transaction created successfully',
        ),
      )
  },
)

// Controller to get transaction summary
export const getTransactionSummary = asyncHandler(
  async (req: Request<{}, {}, { userId: string }>, res: Response) => {
    const { userId } = req.body
    
    if (!userId) {
      throw new ApiError(400, 'User ID is required')
    }
    
    const response = await transaction.getTransactionSummary(userId)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response,
          'Transaction summary retrieved successfully',
        ),
      )
  },
)

// Controller to filter transactions
export const filterTransactions = asyncHandler(
  async (req: Request<{}, {}, TransactionFilterRequest>, res: Response) => {
    const data = req.body
    
    if (!data.userId) {
      throw new ApiError(400, 'User ID is required')
    }
    
    const response = await transaction.filterTransactions(data)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response,
          'Transactions filtered successfully',
        ),
      )
  },
)

// Controller to generate invoice
export const generateInvoice = asyncHandler(
  async (req: Request<{}, {}, InvoiceRequest>, res: Response) => {
    const data = req.body
    
    if (!data.transactionId || !data.userId) {
      throw new ApiError(400, 'Transaction ID and User ID are required')
    }
    
    const response = await transaction.generateInvoice(data)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response,
          'Invoice generated successfully',
        ),
      )
  },
)

// Controller to process refund
export const processRefund = asyncHandler(
  async (req: Request<{}, {}, RefundRequest>, res: Response) => {
    const data = req.body
    
    if (!data.transactionId || !data.userId || !data.reason) {
      throw new ApiError(400, 'Transaction ID, User ID, and reason are required')
    }
    
    const response = await transaction.processRefund(data)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    
    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response,
          'Refund processed successfully',
        ),
      )
  },
)
