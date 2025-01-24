import { Router } from 'express';
import { deleteAllUsers, getUsers, loginUser, registerUser, updateUserRole, verifyPhoneNumber, verifyEmailAndUserName } from '../controllers/userController';
import { REGISTER_USER, GET_ALL_USERS, LOGIN_USER, DELETE_ALL_USERS, UPDATE_ROLE, VERIFY_EMAIL, VERIFY_PHONE, FORGET_EMAIL, FORGET_USERNAME, FORGET_PASSWORD } from './constants';
import { authentication } from '../middlewares/authentication';

const userRouter = Router();
const authRouter = Router()

/*

user routes
1. Register a new user - Done
2. Login an existing user - Done
3. Forget email
4. Forget username
5. Forget password
6. Check for existing user with same email or username
7. Update user details
8. Verify user email - Done
9. Verify user phone number - Done
10. Update Role - Done
11. Delete user

*/

// Auth routes
authRouter.post(REGISTER_USER, registerUser);
authRouter.post(LOGIN_USER, loginUser);
// TODO
// authRouter.post(FORGET_EMAIL, loginUser);
// authRouter.post(FORGET_USERNAME, loginUser);
// authRouter.post(FORGET_PASSWORD, loginUser);

authRouter.post(VERIFY_EMAIL, verifyEmailAndUserName)
authRouter.post(VERIFY_PHONE, verifyPhoneNumber)

// Authenticated routes
userRouter.post(UPDATE_ROLE, authentication, updateUserRole);


// Dev method
userRouter.get(GET_ALL_USERS, authentication, getUsers);
userRouter.get(DELETE_ALL_USERS, authentication, deleteAllUsers);

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



export default { authRouter, userRouter };

