
import express from 'express'
import { isUser } from '../middlewares/userAuth.js'
import passport from'passport'



const userRouter = express.Router()

import {
    loadSignUp, 
    postSignup, 
    loadOTP, 
    postVerifyOTP, 
    resendOTP, 
    loadLogin, 
    postLogin, 
    logout, 
    loadForgotPassword, 
    postForgotPassword, 
    loadForgotPasswordOTP, 
    verifyForgotPasswordOTP, 
    loadResetPassword, 
    postResetPassword

} from '../controllers/user/authController.js' 


import {
    loadHome,
    loadProfile,
    loadEditProfile,
    postEditProfile,
    loadChangePassword,
    postChangePassword,
    loadChangeEmail,
    postChangeEmail,
    loadChangeEmailVerify,
    postChangeEmailVerify,
    resendEmailOtp,
    uploadProfileImage,
 
} from '../controllers/user/userController.js'

import {
    loadAddresses,
    postAddAddresses,
    deleteAddress,
    loadEditAddress,
    postEditAddress,
    setDefaultAddress,


} from '../controllers/user/addressController.js'

import { resendForgotPasswordOTP } from '../controllers/user/authController.js'
import upload from '../middlewares/multerConfig.js'



// signup
userRouter.get('/', loadHome)    // load home page

userRouter.get('/home', loadHome); // load home page

userRouter.get('/signup', loadSignUp)   // load signup page

userRouter.post('/signup', postSignup)   // handle signup form submission

userRouter.get('/otp-verify', loadOTP)   // load otp-verify page

userRouter.post('/otp-verify', postVerifyOTP)   // verify the otp subbmitted by the user

userRouter.get('/resend-otp', resendOTP)   // handle resend otp request


// login/logout
userRouter.get('/login', loadLogin)    // load login page

userRouter.post('/login', postLogin)   // handle login form submission

userRouter.get('/logout', logout)     // logout user and destroy the session


// google login
userRouter.get('/auth/google',passport.authenticate('google', 
    {scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']}))

userRouter.get('/auth/google/callback',
    passport.authenticate('google', {failureRedirect : '/login'}),

    (req,res)=>{
        res.redirect('/home')   // if the google login is successful, redirect to home page
    }
)


// password management
userRouter.get('/forgot-password', loadForgotPassword)   // load forgot password page

userRouter.post('/forgot-password', postForgotPassword)   // handle email submission for password reset

userRouter.get('/forgot-password-otp', loadForgotPasswordOTP)  // load forgot password otp page

userRouter.post('/forgot-password-otp', verifyForgotPasswordOTP)   // verify the forgot password otp submitted by the user

userRouter.get('/reset-password', loadResetPassword)   // load the reset password page

userRouter.post('/reset-password', postResetPassword)   // handle new password submission and update in db

userRouter.get('/resend-forgot-password-otp', resendForgotPasswordOTP)     //  resend the otp fpr forgot password while login


// user profile
userRouter.get('/profile',isUser, loadProfile)  // load user profile page

userRouter.get('/edit-profile', isUser, loadEditProfile) // show the edit profile page

userRouter.post('/profile/edit', isUser, postEditProfile)  // handle profile updates and save to db

userRouter.get('/change-password',isUser, loadChangePassword)   // load change password page for logged in user

userRouter.post('/change-password',isUser, postChangePassword)   // handle password change submission for logged in user

userRouter.post('/update-profile', upload.single('profileImage'), uploadProfileImage)  // profile Image


// change email
userRouter.post('/change-email', isUser, postChangeEmail)    // change email of user

userRouter.get('/change-email-verify',isUser, loadChangeEmailVerify)    // load the verify otp page 

userRouter.post('/change-email-verify',isUser, postChangeEmailVerify)     // verify the otp entered by the user

userRouter.post('/resend-otp', isUser, resendEmailOtp)     // resend new otp when timer expires for changing email





// address management
userRouter.get('/addresses', isUser, loadAddresses)   // load the address page

userRouter.post('/addresses/add',isUser, postAddAddresses)   // add address in save in db

userRouter.get('/addresses/delete/:id',isUser, deleteAddress)   // delete an address from multiple addresses using :id

userRouter.get('/addresses/edit/:id', isUser, loadEditAddress)    // load edit address page

userRouter.post('/addresses/edit/:id',isUser, postEditAddress)   // submit and update address in db 

userRouter.get('/addresses/set-default/:id', isUser, setDefaultAddress)    // set an adress as defaul









 









export default userRouter
