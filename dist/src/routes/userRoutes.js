"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const constants_1 = require("./constants");
const authentication_1 = require("../middlewares/authentication");
const userRouter = (0, express_1.Router)();
const authRouter = (0, express_1.Router)();
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
authRouter.post(constants_1.REGISTER_USER, userController_1.registerUser);
authRouter.post(constants_1.LOGIN_USER, userController_1.loginUser);
authRouter.post(constants_1.VERIFY_EMAIL_AND_USERNAME, userController_1.verifyEmailAndUsername);
authRouter.post(constants_1.VERIFY_OTP, userController_1.verifyOTP);
authRouter.post(constants_1.VERIFY_PHONE, userController_1.verifyPhoneNumber);
// TODO
// authRouter.post(FORGET_EMAIL, loginUser);
// authRouter.post(FORGET_USERNAME, loginUser);
// authRouter.post(FORGET_PASSWORD, loginUser);
// Authenticated routes
userRouter.post(constants_1.UPDATE_ROLE, authentication_1.authentication, userController_1.updateUserRole);
userRouter.post(constants_1.UPSERT_FCM_TOKEN, authentication_1.authentication, userController_1.upsertFCMToken);
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
exports.default = { authRouter, userRouter };
