export const SUCCESS_MESSAGE = {
  OTPSuccess: 'OTP shared successfully',
  // phoneOTPSuccess: 'OTP is been shared to your phone number',
  otpVerified: 'OTP verified successfully',
  registerSuccess: 'Registration successfull',
  loginSuccess: 'Login successfull',
  enrollmentSuccess: 'Successfully enrolled as a Service provider',
  serviceCreated: 'Service creation successfull',
  serviceUpdated: 'Service updated successfull',

  serviceRetreive: 'Service retrieved successfully',
  // General Success
  success: 'Successfully fetched response',
  deletedSuccessFully: 'Deleted Successfully',
  bookingSuccessFull: 'Slot booked successfully',
  serviceDeleted:"Service deleted"

}

export const ERROR_MESSAGE = {
  invalidEmail: 'Invalid email',
  invalidPassword: 'Invalid password',
  invalidUsername: 'Invalid username',
  invalidOTP: 'Invalid otp',
  duplicateEmail: 'User with the same email already registered',
  duplicateUsername: 'User with the same username already exists',
  duplicatePhoneNumber: 'User with the same phone number already registered',
  registrationFailure: 'Fail to register user',
  loginFailure: 'Fail to login user',
  userEmailFound: "User with this email doesn't exists. Please register!",
  userNotFound: 'User not found',
  enrollmentFailure: 'Fail to enroll as a service provider',
  FCMtokenFailure:"Failed to enable notification",
  notAuthorized:
    'User must be enrolled as a service provider to create an service',
  serviceNotFound: 'Service not found',
  otpGenerationFailed: 'OTP generation Failed',
  otpVerifcationFailed: 'OTP Verification Failed',
  serviceFailure: 'Unable to create service',
  errorInService: 'Failed to retrive service',
  bookingFailure:"Failed to book service",
  invalidCategory:"Invalid Category",
  invalidData: "Invalid data",

  // Common Errors
  generalError: 'An error has occured',
}
