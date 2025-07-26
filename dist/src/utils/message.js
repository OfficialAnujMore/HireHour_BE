"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ERROR_MESSAGE = exports.SUCCESS_MESSAGE = void 0;
exports.SUCCESS_MESSAGE = {
    otpSuccess: 'OTP sent successfully.',
    otpVerified: 'OTP verified successfully.',
    registerSuccess: 'Registration completed successfully.',
    loginSuccess: 'Logged in successfully.',
    enrollmentSuccess: 'You have successfully enrolled as a service provider.',
    serviceCreated: 'Service created successfully.',
    serviceUpdated: 'Service updated successfully.',
    serviceRetreive: 'Service retrieved successfully.',
    // General Success
    success: 'Request completed successfully.',
    deletedSuccessFully: 'Deleted successfully.',
    bookingSuccessFull: 'Slot booked successfully.',
    serviceDeleted: 'Service deleted successfully.',
};
exports.ERROR_MESSAGE = {
    invalidEmail: 'Please enter a valid email address.',
    invalidPassword: 'Password must meet the required criteria.',
    invalidUsername: 'Username is invalid.',
    invalidOTP: 'Entered OTP is invalid.',
    duplicateEmail: 'An account with this email already exists.',
    duplicateUsername: 'This username is already taken.',
    duplicatePhoneNumber: 'An account with this phone number already exists.',
    registrationFailure: 'Failed to register. Please try again.',
    loginFailure: 'Login failed. Please check your credentials.',
    userEmailFound: 'No account found with this email. Please register.',
    userNotFound: 'User not found.',
    enrollmentFailure: 'Failed to enroll as a service provider.',
    fcmTokenFailure: 'Unable to enable notifications.',
    notAuthorized: 'You must be enrolled as a service provider to create a service.',
    serviceNotFound: 'Service not found.',
    otpGenerationFailed: 'Failed to generate OTP. Please try again.',
    otpVerifcationFailed: 'OTP verification failed. Please try again.',
    serviceFailure: 'Failed to create service.',
    errorInService: 'Unable to retrieve service details.',
    errorInSlotApproval: 'Unable to approve slot',
    bookingFailure: 'Failed to book slot. Please try again.',
    invalidCategory: 'Selected category is invalid.',
    invalidData: 'Submitted data is invalid.',
    // Common Errors
    generalError: 'Something went wrong. Please try again later.',
};
