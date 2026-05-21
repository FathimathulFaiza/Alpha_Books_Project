
import express from "express"
import mongoose from "mongoose";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js"
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

const userRouter = express.Router()

import userController from '../controllers/userController.js'
import adminController from "../controllers/adminController.js";

userRouter.get('/',userController.loadHome) // load the home page

userRouter.get('/signup',userController.loadSignUp)  // load the sign up page

userRouter.post('/signup', userController.postSignup)  // get the user filled data in the signup page in the backend

userRouter.get('/otp-verify', userController.loadOTP)   // load the otp verification page

userRouter.post('/otp-verify', userController.postVerifyOTP) // route to load when type the OPTP and click submit

userRouter.get('/login',userController.loadLogin)  // get the login page

userRouter.post('/login', userController.postLogin)  // route to recieve the data from login page (form data)

userRouter.get('/resend-otp', userController.resendOTP)  // load when resend otp button clicks

userRouter.get('/forgot-password',userController.loadForgotPassword) // load the forgot password page

userRouter.post('/forgot-password',userController.postForgotPassword)   // when user submit the email

userRouter.get('/forgot-password-otp',userController.loadForgotPasswordOTP)  // load the forgot password otp page

userRouter.post('/forgot-password-otp',userController.verifyForgotPasswordOTP)   // verify the otp (post)

userRouter.get('/reset-password',userController.loadRestPassword)    // get the reset password page

userRouter.get('/reset-password',userController.loadRestPassword)    // load the reset-password page (get)

userRouter.post('/reset-password',userController.postResetPassword)  // to submit the new password  (post)

userRouter.get('/profile',userController.loadProfile)  // load the user profile page



 


userRouter.get('/logout', userController.logout)  // logout user

export default userRouter
