import express from 'express';
const router = express.Router();
import {authenticateToken} from '../middlewares/authentication.js';
import {registerData,email,loginpost,resetPassword,forgotpassword,listUser,editData,delData,payment,addMoneyToWallet,addParkingSlots,getRemainingSlots,slotParkedUser} from '../authController/UserController.js';
import {checkValidation} from '../middlewares/userValidation.js';
import {checkUserRole} from '../middlewares/authorization.js';
router.post('/register',checkValidation, registerData);
router.post('/login',loginpost);
router.post('/forgetpassword',forgotpassword);
router.post('/resetpassword/:id',resetPassword);
router.get('/email/:userId', email);
router.use(authenticateToken);
router.put('/editData/:id',checkValidation,editData);
router.post('/delete/:id',delData);
router.get('/listuser',checkUserRole('2'),listUser);
router.post('/parkingslot/:id', addParkingSlots);
router.post('/slotparkeduser/:id', slotParkedUser);
router.post('/payment',payment);
router.post('/walletmoney/:id',addMoneyToWallet);
router.get('/remainingSlots/:id', getRemainingSlots);



export default router;