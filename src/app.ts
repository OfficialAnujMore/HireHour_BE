import cookieParser from 'cookie-parser'
import express, { NextFunction, Request, Response } from 'express'
import cors from 'cors'
import serviceRoutes from './routes/serviceRoutes'
import routes from './routes/userRoutes'
import {
  V1_AUTH_BASE_ROUTE,
  V1_SERVICE_BASE_ROUTE,
  V1_TRANSACTION_BASE_ROUTE,
  V1_USER_BASE_ROUTE,
} from './routes/constants'
import { ApiError } from './utils/ApiError'
import transactionRoutes from './routes/transactionRoutes'
import './cron-jobs/index'
const { authRouter, userRouter } = routes
const { authorizedServiceRouter, serviceRouter } = serviceRoutes
const { transactionRouter } = transactionRoutes



const app = express()
app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // Todo: Find type
    //   credential: true,
  }),
)

app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ extended: true, limit: '50mb' }))
app.use(express.static('public'))
app.use(cookieParser())

app.use(V1_AUTH_BASE_ROUTE, authRouter)
app.use(V1_USER_BASE_ROUTE, userRouter)
app.use(V1_SERVICE_BASE_ROUTE, authorizedServiceRouter)
app.use(V1_SERVICE_BASE_ROUTE, serviceRouter)
app.use(V1_TRANSACTION_BASE_ROUTE, transactionRouter)


app.use((err: Error, _req: Request, res: Response, next: NextFunction) => {
  console.error('Error caught in middleware:', err) // Debugging

  // Handle payload too large errors
  if (err.name === 'PayloadTooLargeError' || err.message.includes('entity too large')) {
    return res.status(413).json({
      statusCode: 413,
      message: 'Request payload too large. Please reduce image size or compress images.',
      success: false,
      errors: [],
    })
  }

  if (err instanceof ApiError) {
    return res.status(err.statusCode).json(err.toJSON())
  }

  return res.status(500).json({
    statusCode: 500,
    message: err.message || 'Internal Server Error',
    success: false,
    errors: [],
  })
})
export default app
