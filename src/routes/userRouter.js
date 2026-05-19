
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

userRouter.get('/logout', userController.logout)  // logout user

userRouter.get('/resend-otp', userController.resendOTP)  // load when resend otp button clicks



 




export default userRouter
