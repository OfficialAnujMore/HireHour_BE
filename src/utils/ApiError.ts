class ApiError extends Error {
  statusCode: number
  data: null
  success: boolean
  errors: any[]

  constructor(
    statusCode: any,
    message = 'Something went wrong',
    errors = [],
    stack = '',
  ) {
    super(message)
    this.statusCode = statusCode
    this.data = null
    this.message = message
    this.success = false
    this.errors = errors

    if (stack) {
      this.stack = stack
    } else {
      Error.captureStackTrace(this, this.constructor)
    }
  }
  toJSON() {
    return {
      statusCode: this.statusCode,
      data: this.data,
      message: this.message,
      success: this.success,
    }
  }
}

export { ApiError }
