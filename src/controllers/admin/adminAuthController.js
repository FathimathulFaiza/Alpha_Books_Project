
import User from '../../models/userModel.js';
import bcrypt from 'bcrypt';



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

        if(!email || !password){       // validation for empty box

          return  res.render('admin/login' , {
                error : "Please fill both email and password..! "
            })

        }

// email validation check
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if(!emailRegex.test(email)){
            return res.render('admin/login', {
                error : "Invalid email format"
            })
        }


      const adminData = await User.findOne({email : email, isAdmin : true})    // finding the admin from database

      // checking the password
      if(adminData){

        const isMatch = await bcrypt.compare(password,adminData.password) // bcrypt the password

        if(isMatch){
            req.session.admin_id = adminData._id    // save the admin id in session

            res.redirect("/admin/dashboard")
        }
        else{
            return res.render('admin/login', {
                error : "Invalid email or password..!"
            })
        }
    }
        else{
            return res.render('admin/login', {
                error : "Admin not found..!"
            })
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

        const password = process.env.ADMIN_PASSWORD

        const hashedPassword = await bcrypt.hash(password,10)

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

export default { 
    loadLogin, 
    verifyLogin, 
    createAdmin, 
    logout,
};