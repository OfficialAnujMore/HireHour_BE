import { Router } from 'express';
import { deleteAllUsers, getUsers, registerUser } from '../controllers/userController';
import { CREATE_USER } from './constants';
import { authentication } from '../middlewares/authentication';

const router = Router();

router.post(CREATE_USER, registerUser);
router.get('/getUsers', authentication, getUsers);
router.get('/deleteAllUsers', authentication, deleteAllUsers);

export default router;
