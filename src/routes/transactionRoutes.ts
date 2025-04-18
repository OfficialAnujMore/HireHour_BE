import { Router } from 'express'
import { GET_USER_TRANSACTION } from './constants'
import { authentication } from '../middlewares/authentication'
import { authorization } from '../middlewares/authorization'
import { getMyTransactions } from '../controllers/transactionController'

const transactionRouter = Router()

transactionRouter.post(
  GET_USER_TRANSACTION,
  authentication,
  getMyTransactions,
)

export default { transactionRouter }
