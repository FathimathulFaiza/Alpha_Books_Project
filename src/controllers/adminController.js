
import User from '../models/userModel.js'
import Category from '../models/categoryModel.js'
import product from '../models/productModel.js'

import bcrypt from 'bcrypt'





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




// export functions 
export default {loadLogin,verifyLogin,createAdmin,loadDashboard,logout,loadUsers,toggleBlockUser};