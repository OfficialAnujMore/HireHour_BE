import { Router } from 'express';
import { deleteAllUsers, getUsers, loginUser, registerUser, updateUserRole, addService } from '../controllers/userController';
import { getUserServices } from '../controllers/serviceController'
import { CREATE_USER } from './constants';
import { authentication } from '../middlewares/authentication';

const router = Router();

router.post(CREATE_USER, registerUser);
router.post('/loginUser', loginUser);
router.post('/updateUserRole', authentication, updateUserRole);
router.post('/addService', authentication, addService);
router.get('/getUsers', authentication, getUsers);
router.post('/getUserServices', authentication, getUserServices);
router.get('/deleteAllUsers', authentication, deleteAllUsers);

export default router;
