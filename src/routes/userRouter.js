
import express from "express"
import mongoose from "mongoose";
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js"
import bcrypt from "bcrypt";
import User from "../models/userModel.js";

import userController from '../controllers/userController.js'

userRouter.get('/',userController.loadHome) // load the home page






export default userRouter
