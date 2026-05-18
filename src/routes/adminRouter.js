
import express from "express"
import Category from "../models/categoryModel.js"
import Product from "../models/productModel.js"
import adminController from "../controllers/adminController.js"
import * as auth from '../middlewares/adminAuth.js'

const adminRouter = express.Router()


// routes


adminRouter.post('/login',adminController.verifyLogin)

adminRouter.get('/create_admin',adminController.createAdmin)

adminRouter.get('/dashboard',auth.isLogin,adminController.loadDashboard)   // show 'dashboard' only if logged in

adminRouter.get('/login',auth.isLogout,adminController.loadLogin)  // do not show login page if already logged in

adminRouter.get('/users',auth.isLogin,adminController.loadUsers)    // show the users list

adminRouter.get('/users/toggle-block/:id', adminController.toggleBlockUser)   // block or unblock the user

adminRouter.get('/category', auth.isLogin,adminController.getCategoryPage)  // list the category pages 

adminRouter.post('/category/add',auth.isLogin,adminController.addCategory)   // add category

adminRouter.get('/category/toggle-list/:id',auth.isLogin,adminController.toggleCategoryList) // toggele -> list/unList 

adminRouter.get('/category/edit/:id',auth.isLogin,adminController.loadEditCategory)   // get edit category page

adminRouter.post('/category/edit/:id',auth.isLogin,adminController.editCategory)   // update the edit category




adminRouter.get('/logout',auth.isLogin,adminController.logout)

export default adminRouter


// auth.isLogin -> middleware to authenticate the admin , only admin can view