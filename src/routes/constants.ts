// BASE ROUTE
export const V1_AUTH_BASE_ROUTE = '/api/v1/auth'
export const V1_USER_BASE_ROUTE = '/api/v1/user'
export const V1_SERVICE_BASE_ROUTE = '/api/v1/service'
export const V1_TRANSACTION_BASE_ROUTE = '/api/v1/transaction'


// USER ROUTES

// 1. Register a new user
// 2. Login an existing user
// 3. Reset password
// 5. Forget username
// 6. Check for existing user with same email or username
// 7. Update user details
// 8. Verify user email
// 9. Verify user phone number
export const REGISTER_USER = '/registerUser'
export const LOGIN_USER = '/loginUser'
export const FORGET_EMAIL = '/forgetEmail'
export const FORGET_USERNAME = '/forgetUsername'
export const FORGET_PASSWORD = '/resetPassword'
export const VALIDATE_EXISTING_USER = '/validateExistingUser'
export const UPDATE_USER_DETAILS = '/updateUserDetails'
export const VERIFY_EMAIL_AND_USERNAME = '/verifyUsernameAndEmail'
export const VERIFY_PHONE = '/verifyPhone'
export const VERIFY_OTP = '/verifyOTP'
export const UPDATE_ROLE = '/updateRole'

// SERVICE ROUTES
export const UPSERT_SERVICE = '/upsertService'
export const UPDATE_SERVICE = '/updateService'

export const GET_USER_SERVICES = '/getUserServices'
export const GET_SERVICE_PROVIDERS = '/getServiceProviders'
export const DELETE_SERVICE = '/deleteService'
export const BOOK_SERVICE = '/bookService'
export const HOLD_SLOTS = '/holdSlots'
export const APPROVE_SLOTS = '/approveSlots'
export const GET_BOOKED_SERVICES = '/getBookedService'



export const UPCOMING_EVENTS = '/upcomingEvents'
export const UPSERT_FCM_TOKEN ='/upsertFCMToken'
export const FCM_TESTER = '/fcmTester'

// TRANSACTION ROUTES
export const GET_USER_TRANSACTION = '/getUserTransaction'

