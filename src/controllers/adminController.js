
import User from '../models/userModel.js'
import Category from '../models/categoryModel.js'
import product from '../models/productModel.js'

import bcrypt from 'bcrypt'
import slugify from 'slugify'





// function to show the admin login
const loadLogin = async (req, res) => {

    try {
        res.render("admin/login"); 
    } catch (error) {
        console.log("Error loading login page:", error.message);
        res.status(500).send("Internal Server Error");
    }
};


// function to verify the login 

const verifyLogin = async(req,res) =>{

    try {
        const {email,password} = req.body

      const adminData = await User.findOne({email : email, isAdmin : true})

      // checking the password
      if(adminData){

        const isMatch = await bcrypt.compare(password,adminData.password) // bcrypt the password

        if(isMatch){
            req.session.admin_id = adminData._id    // save the admin id in session

            res.redirect("/admin/dashboard")
        }
        else{
            res.send("Error..! Invalid password")
        }
    }
        else{
            res.send("Admin not found..!")
        }
      }  
    catch(error){
        console.log("Login Verification Error ",error.message)
        res.status(500).send("Internal Server error")
    }
}



// create Admin

const createAdmin = async(req,res) =>{

    try{
        const hashedPassword = await bcrypt.hash("admin123",10)

        const newAdmin = new User({

            firstName : "admin",
            lastName : "Admin",
            email : "admin@gmail.com",
            password : hashedPassword,
            isAdmin : true,
            isVerified : true

        })

        await newAdmin.save()

        res.send("Admin created Successfully.!")
    }
    catch(error){

        res.send("Error : ",error.message)
    }
}


// function to show the dashboard

const loadDashboard = async(req,res)=>{

    try{
        res.render("admin/dashboard")
    }
    catch(error){
        console.log(error.message)
    }
}


// admin 'logout' function 

const logout = async (req,res) =>{

    try{

        res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
        res.header('Expires', '-1');
        res.header('Pragma', 'no-cache');

        req.session.destroy((err)=>{      // destroy the session

            if(err){
                console.log(err.message)
                res.send("Error logging out")
            }
            else{
                res.redirect('/admin/login')    // if 'destroyed' the session successfully redirect to 'login' page
            }
        })
    }
    catch(error){
        console.log(error.message)

    }
}
    

// function to show the users list (loadUsers) -> (search ,pagination, descending order and sorting)

    const loadUsers = async(req,res)=>{

        try{

            const searchQuery = req.query.search || ""      // get the value coming from the search bar through URL

            const page = parseInt(req.query.page)|| 1  // pagination , default page 1 -> to get the current page from url (?page=2) -> convert the string to number from url

            const limit = 10    // number of users display per page (set the limit) -> (1−1)×10=0.

            const skip = (page - 1) * limit

            const searchCriteria = {  // search in the db

                $or :[
                    {firstName: {$regex : searchQuery, $options : "i"}},
                    {lastName : {$regex : searchQuery, $options : "i"}},
                    {email : {$regex : searchQuery, $options : "i"}}
                ]
            }


            const users = await User.find(searchCriteria)   // fetch the users with matching criteria
            .sort({createdAt : -1})    // descending order -> latest first
            .skip(skip)     // pagination
            .limit(limit)   // limit of showing users


            const totalUsers = await User.countDocuments(searchCriteria)  // total count of users fetch from db according to the criteria
            
            const totalPages = Math.ceil(totalUsers / limit)  // total number of pages 

 
            res.render("admin/users",{    // render the page and pass the  user along with search query -> pass all the necessary variables along with

                users : users,
                searchQuery : searchQuery,
                currentPage : page,
                totalPages : totalPages,
                title : "Users"

            });
        }
        catch(error){
            console.log("Error in loadUsers",error.message);
            res.status(500).send("Server Error")

        }
    }


    // function to block or unblock user

    const toggleBlockUser = async (req,res)=>{

        try{
   
    const userId = req.params.id

    // find the user by id
    const user = await User.findById(userId)


    if(!user){

        return res.status(404).send("User not found..!!")
    }

    // toggle the 'isBlocked' status -> true become false, false become true

    await User.findByIdAndUpdate(userId ,{
        $set :{isBlocked : !user.isBlocked}
    })

    // redirect back to the users list page 

    res.redirect('/admin/users')

    }
    catch(error){
        console.log("Error in toggleBlockUser : ",error.message)

        res.status(500).send("Server Error...!")
   }

    }




    // function to show the category page

    const getCategoryPage = async (req,res)=>{

        try{
            const categories = await Category.find().sort({createdAt : -1})  // take all the categories list from db in descending order-> latest first

            res.render('admin/categories',{  // rendering the categories
                categories : categories,
                title : "Category",
                error : null
            })
        }
        catch(error){
            console.log("Error in category Page..",error)
            res.status(500).send("Internal Server Error")
        }
    }



    // function to add a new category

    const addCategory = async(req,res)=>{
        try{
            const {name, description} = req.body


            // check if category is already exists
            const existingCategory = await Category.findOne({
                name :{$regex: new RegExp("^" + name + "$" , "i")}   // search the exact name , same name starts with and w=ends with ,no matter case sensitive
            })


            // if the category already exists
            if(existingCategory){
                console.log("Category already Exists..!")

                const categories = await Category.find().sort({createdAt:-1})

                return res.render('admin/categories',{
                    categories : categories,
                    title : "Category",
                    error : "Category already exists..!!"
                })
            }

            // generate 'Slug'

            const slug = slugify(name, {lower : true, strict : true})  // to make the 'slug' -> name of the category,make lowerCase, remove other symbols
            

          // creating new category and save to db
            const newCategory = new Category({
                name ,
                slug ,
                description,
                isListed : true
            })

            await newCategory.save()

            res.redirect('/admin/category')
        }
        catch(error){
            console.log("Error in addCategory!",error.message)
            const categories = await Category.find({}).sort({createdAt:-1})
            res.render('admin/categories', {categories, 
                title : "Category",
                error : "Problem in adding category.!!"})

        }
    }



    // function for toggle button incategoreies list/unList

    const toggleCategoryList = async (req,res)=>{

        try{
            const categoryId = req.params.id
            
            // find the category using id
            const category = await Category.findById(categoryId)

            if(!category){

                console.log("Category ot found.!!")
                return res.redirect('/admin/category')
            }

            // to make the toggle list or unList 
            category.isListed = !category.isListed

            await category.save() // save the changes in db

            res.redirect('/admin/category')
        }
        catch(error){
            console.log("Error in toggleCategoryList",error.message)
            res.redirect('/admin/category')

        }
    }

   // function to load the edit category page

   const loadEditCategory = async(req,res)=>{
    try{
        const id = req.params.id

        const category = await Category.findById(id)

        if(!category){
            return res.redirect('/admin/category')
        }

        res.render('admin/editCategory',{
            category : category,
            title : "Category",
            error : null
        })
    }
    catch(error){
        console.log("Error in loadEditCategory",error.message)
        res.status(500).send("Internal Server Error")

    }
   }


   // function to update in the db of edited category

   const  editCategory = async (req,res)=>{
    try{
        const id = req.params.id

        const {name, description} = req.body
        
        //checking the duplicate
        const existingCategory = await Category.findOne({

            name : {$regex : new RegExp("^" + name + "$" , "i")},
            _id :{$ne: id}    // id should not be same
        })

        // if category exists

        if(existingCategory){

            const category = await Category.findById(id)

            return res.render('admin/category',{
                category : category,
                title : "Category",
                error : "Category name already exists..!"

            })
        }

        // generate slug for the new category

        const slug = slugify(name, {lower : true, strict : true})


        //update db
        await Category.findByIdAndUpdate(id, {
            $set :{
                name : name,
                slug : slug,
                description : description
            }
        })
        res.redirect('/admin/category')
    }
    catch(error){
        console.log("Error in edit category..!",error.message)

        res.status(500).send("Internal Server Error")
    }
   }




// export functions 
export default {loadLogin,
    verifyLogin,
    createAdmin,
    loadDashboard,
    logout,
    loadUsers,
    toggleBlockUser,
    getCategoryPage,
    addCategory,
    toggleCategoryList,
    loadEditCategory,
    editCategory,
};