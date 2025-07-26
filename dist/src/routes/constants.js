"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GET_USER_TRANSACTION = exports.FCM_TESTER = exports.UPSERT_FCM_TOKEN = exports.UPCOMING_EVENTS = exports.GET_BOOKED_SERVICES = exports.APPROVE_SLOTS = exports.HOLD_SLOTS = exports.BOOK_SERVICE = exports.DELETE_SERVICE = exports.GET_SERVICE_PROVIDERS = exports.GET_USER_SERVICES = exports.UPDATE_SERVICE = exports.UPSERT_SERVICE = exports.UPDATE_ROLE = exports.VERIFY_OTP = exports.VERIFY_PHONE = exports.VERIFY_EMAIL_AND_USERNAME = exports.UPDATE_USER_DETAILS = exports.VALIDATE_EXISTING_USER = exports.FORGET_PASSWORD = exports.FORGET_USERNAME = exports.FORGET_EMAIL = exports.LOGIN_USER = exports.REGISTER_USER = exports.V1_TRANSACTION_BASE_ROUTE = exports.V1_SERVICE_BASE_ROUTE = exports.V1_USER_BASE_ROUTE = exports.V1_AUTH_BASE_ROUTE = void 0;
// BASE ROUTE
exports.V1_AUTH_BASE_ROUTE = '/api/v1/auth';
exports.V1_USER_BASE_ROUTE = '/api/v1/user';
exports.V1_SERVICE_BASE_ROUTE = '/api/v1/service';
exports.V1_TRANSACTION_BASE_ROUTE = '/api/v1/transaction';
// USER ROUTES
// 1. Register a new user
// 2. Login an existing user
// 3. Reset password
// 5. Forget username
// 6. Check for existing user with same email or username
// 7. Update user details
// 8. Verify user email
// 9. Verify user phone number
exports.REGISTER_USER = '/registerUser';
exports.LOGIN_USER = '/loginUser';
exports.FORGET_EMAIL = '/forgetEmail';
exports.FORGET_USERNAME = '/forgetUsername';
exports.FORGET_PASSWORD = '/resetPassword';
exports.VALIDATE_EXISTING_USER = '/validateExistingUser';
exports.UPDATE_USER_DETAILS = '/updateUserDetails';
exports.VERIFY_EMAIL_AND_USERNAME = '/verifyUsernameAndEmail';
exports.VERIFY_PHONE = '/verifyPhone';
exports.VERIFY_OTP = '/verifyOTP';
exports.UPDATE_ROLE = '/updateRole';
// SERVICE ROUTES
exports.UPSERT_SERVICE = '/upsertService';
exports.UPDATE_SERVICE = '/updateService';
exports.GET_USER_SERVICES = '/getUserServices';
exports.GET_SERVICE_PROVIDERS = '/getServiceProviders';
exports.DELETE_SERVICE = '/deleteService';
exports.BOOK_SERVICE = '/bookService';
exports.HOLD_SLOTS = '/holdSlots';
exports.APPROVE_SLOTS = '/approveSlots';
exports.GET_BOOKED_SERVICES = '/getBookedService';
exports.UPCOMING_EVENTS = '/upcomingEvents';
exports.UPSERT_FCM_TOKEN = '/upsertFCMToken';
exports.FCM_TESTER = '/fcmTester';
// TRANSACTION ROUTES
exports.GET_USER_TRANSACTION = '/getUserTransaction';
