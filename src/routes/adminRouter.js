

import express from "express"


import adminAuthController from "../controllers/admin/adminAuthController.js"
import adminUserController from "../controllers/admin/adminUserController.js"
import adminCategoryController from "../controllers/admin/adminCategoryController.js"
import adminDashboardController from "../controllers/admin/adminDashboardController.js"


import * as auth from '../middlewares/adminAuth.js'

const adminRouter = express.Router()


// auth routes
adminRouter.get('/login', auth.isLogout, adminAuthController.loadLogin)

adminRouter.post('/login',auth.isLogout, adminAuthController.verifyLogin)

adminRouter.get('/create_admin',adminAuthController.createAdmin)

adminRouter.get('/logout',auth.isLogin,adminAuthController.logout)



// dashboard
adminRouter.get('/dashboard',auth.isLogin,adminDashboardController.loadDashboard)   // show 'dashboard' only if logged in





//user management
adminRouter.get('/users',auth.isLogin,adminUserController.loadUsers)    // show the users list

adminRouter.get('/users/toggle-block/:id', auth.isLogin, adminUserController.toggleBlockUser)   // block or unblock the user



// category management
adminRouter.get('/category', auth.isLogin,adminCategoryController.getCategoryPage)  // list the category pages 

adminRouter.post('/category/add',auth.isLogin,adminCategoryController.addCategory)   // add category

adminRouter.get('/category/toggle-list/:id',auth.isLogin,adminCategoryController.toggleCategoryList) // toggele -> list/unList 

adminRouter.get('/category/edit/:id',auth.isLogin,adminCategoryController.loadEditCategory)   // get edit category page

adminRouter.post('/category/edit/:id',auth.isLogin,adminCategoryController.editCategory)   // update the edit category



// admin utilities




export default adminRouter


// auth.isLogin -> middleware to authenticate the admin , only admin can view