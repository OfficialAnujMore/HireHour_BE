'use strict'
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod }
  }
Object.defineProperty(exports, '__esModule', { value: true })
const cookie_parser_1 = __importDefault(require('cookie-parser'))
const express_1 = __importDefault(require('express'))
const cors_1 = __importDefault(require('cors'))
const serviceRoutes_1 = __importDefault(require('./routes/serviceRoutes'))
const userRoutes_1 = __importDefault(require('./routes/userRoutes'))
const constants_1 = require('./routes/constants')
const ApiError_1 = require('./utils/ApiError')
const transactionRoutes_1 = __importDefault(
  require('./routes/transactionRoutes'),
)
require('./cron-jobs/index')
const { authRouter, userRouter } = userRoutes_1.default
const { authorizedServiceRouter, serviceRouter } = serviceRoutes_1.default
const { transactionRouter } = transactionRoutes_1.default
const app = (0, express_1.default)()
app.use(
  (0, cors_1.default)({
    origin: process.env.CORS_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    // Todo: Find type
    //   credential: true,
  }),
)
app.use(express_1.default.json({ limit: '50mb' }))
app.use(express_1.default.urlencoded({ extended: true, limit: '50mb' }))
app.use(express_1.default.static('public'))
app.use((0, cookie_parser_1.default)())
app.use(constants_1.V1_AUTH_BASE_ROUTE, authRouter)
app.use(constants_1.V1_USER_BASE_ROUTE, userRouter)
app.use(constants_1.V1_SERVICE_BASE_ROUTE, authorizedServiceRouter)
app.use(constants_1.V1_SERVICE_BASE_ROUTE, serviceRouter)
app.use(constants_1.V1_TRANSACTION_BASE_ROUTE, transactionRouter)
app.use((err, _req, res, next) => {
  console.error('Error caught in middleware:', err) // Debugging
  // Handle payload too large errors
  if (
    err.name === 'PayloadTooLargeError' ||
    err.message.includes('entity too large')
  ) {
    return res.status(413).json({
      statusCode: 413,
      message:
        'Request payload too large. Please reduce image size or compress images.',
      success: false,
      errors: [],
    })
  }
  if (err instanceof ApiError_1.ApiError) {
    return res.status(err.statusCode).json(err.toJSON())
  }
  return res.status(500).json({
    statusCode: 500,
    message: err.message || 'Internal Server Error',
    success: false,
    errors: [],
  })
})
exports.default = app
