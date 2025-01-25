class ApiReponse {
  statusCode: number
  data: null
  success: boolean
  errors: any[]
  message: string
  constructor(statusCode: number, data: any, message = 'Success') {
    this.statusCode = statusCode
    this.data = data
    this.message = message
    this.success = statusCode < 400
  }
}

export { ApiReponse }
