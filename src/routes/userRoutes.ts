import { Router } from 'express';
import { deleteAllUsers, getUsers, loginUser, registerUser, updateUserRole } from '../controllers/userController';
import { addService, getUserServices } from '../controllers/serviceController'
import { ADD_SERVICE, CREATE_USER, DELETE_ALL_USERS, GET_ALL_USERS, GET_USER_SERVICES, LOGIN_USER, UPDATE_USER_ROLE } from './constants';
import { authentication } from '../middlewares/authentication';

const router = Router();
// USER ROUTES
router.post(CREATE_USER, registerUser);
router.post(LOGIN_USER, loginUser);
router.post(UPDATE_USER_ROLE, authentication, updateUserRole);
router.get(GET_ALL_USERS, authentication, getUsers);

// Only for dev
// router.get(DELETE_ALL_USERS, authentication, deleteAllUsers);

// SERVICE ROUTES
router.post(ADD_SERVICE, authentication, addService);
router.post(GET_USER_SERVICES, authentication, getUserServices);
export default router;
