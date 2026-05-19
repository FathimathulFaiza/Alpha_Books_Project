
import express from "express"
import mongoose from "mongoose";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js"
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

const userRouter = express.Router()

import userController from '../controllers/userController.js'

userRouter.get('/',userController.loadHome) // load the home page

userRouter.get('/signup',userController.loadSignUp)  // load the sign up page

userRouter.post('/signup', userController.postSignup)  // get the user filled data in the signup page in the backend

userRouter.get('/otp-verify', userController.loadOTP)   // load the otp verification page

userRouter.post('/otp-verify', userController.postVerifyOTP) // route to load when type the OPTP and click submit


 




export default userRouter
