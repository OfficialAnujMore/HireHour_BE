import { Router } from 'express'
import {
  loginUser,
  registerUser,
  updateUserRole,
  upsertFCMToken,
  // verifyPhoneNumber,
  verifyEmailAndUsername,
  verifyOTP,
  verifyPhoneNumber,
} from '../controllers/userController'
import {
  REGISTER_USER,
  LOGIN_USER,

  UPDATE_ROLE,
  VERIFY_EMAIL_AND_USERNAME,
  VERIFY_PHONE,
  FORGET_EMAIL,
  FORGET_USERNAME,
  FORGET_PASSWORD,
  VERIFY_OTP,
  UPSERT_FCM_TOKEN,
} from './constants'
import { authentication } from '../middlewares/authentication'

const userRouter = Router()
const authRouter = Router()

/*

user routes
1. Register a new user - Completed
2. Login an existing user - Completed
3. Forget email 
4. Forget username
5. Forget password
6. Check for existing user with same email or username - Completed
7. Update user details
8. Verify user email - Done
9. Verify user phone number - Done
10. Update Role - Done
11. Delete user

*/

// Auth routes
authRouter.post(REGISTER_USER, registerUser)
authRouter.post(LOGIN_USER, loginUser)
authRouter.post(VERIFY_EMAIL_AND_USERNAME, verifyEmailAndUsername)
authRouter.post(VERIFY_OTP, verifyOTP)
authRouter.post(VERIFY_PHONE, verifyPhoneNumber)
// TODO
// authRouter.post(FORGET_EMAIL, loginUser);
// authRouter.post(FORGET_USERNAME, loginUser);
// authRouter.post(FORGET_PASSWORD, loginUser);



// Authenticated routes
userRouter.post(UPDATE_ROLE, authentication, updateUserRole)
userRouter.post(UPSERT_FCM_TOKEN, authentication, upsertFCMToken)

/*
TODO: Complete this method after all the validations are done
3. Reset password
4. Forget password
5. Forget username
6. Check for existing user with same email or username
7. Update user details
8. Verify user email
9. Verify user phone number

*/

export default { authRouter, userRouter }
