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
    // Log the error when an instance is created
    console.error(`ApiError: ${this.message}`, {
      statusCode: this.statusCode,
      errors: this.errors,
      stack: this.stack,
    })
  }
  toJSON() {
    return {
      statusCode: this.statusCode,
      data: this.data,
      message: this.message,
      success: this.success,
      errors: this.errors,
    }
  }
}

export { ApiError }
