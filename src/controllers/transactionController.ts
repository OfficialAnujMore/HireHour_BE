import { Request, Response } from 'express'
import transaction from '../services/transactionService'
import { ApiError } from '../utils/ApiError'
import { ApiResponse } from '../utils/ApiResponse'
import { asyncHandler } from '../utils/asyncHandler'

import { ERROR_MESSAGE, SUCCESS_MESSAGE } from '../utils/message'

// Controller to get all the user transaction
export const getMyTransactions = asyncHandler(
  async (req: Request, res: Response) => {
    const response = await transaction.getMyTransactions(req.body.userId)
    if (!response) {
      throw new ApiError(500, ERROR_MESSAGE.errorInService)
    }
    console.log(response);
    
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
