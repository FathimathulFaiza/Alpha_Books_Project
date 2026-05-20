import nodemailer from 'nodemailer'
import User from '../models/userModel.js'



//  generate the otp

const generateOTP = ()=>{
    const otp = Math.floor(100000 + Math.random() * 900000).toString()   // creating 6 digit string
    const expiry = new Date(Date.now() + 120000)  // 2min expiry

    return {otp, expiry}
}




// setup to transport send email via 'gmail'

const transporter = nodemailer.createTransport({
   service: 'gmail',
    auth: {
        user: process.env.NODEMAILER_EMAIL,
        pass: process.env.NODEMAILER_PASSWORD
    } 
});

console.log(process.env.NODEMAILER_EMAIL)
console.log(process.env.NODEMAILER_PASSWORD)

// function to load user home page

const loadHome = async(req,res)=>{

    try{
        res.render('user/home',{
            title : "Alpha Books - Home"
        })
    }
    catch(error){
        console.log("Error in home load controller", error.message)
        res.status(500).send("Internal Server Error..!")
        
    }
}


// function to user sign up

  const loadSignUp = async(req,res)=>{
    try{
        res.render('user/signup',{
            title : "Alpha Books - Sign Up"
        })
    }
    catch(error){
        console.log("Error in loadSignUp controller",error.message)
        res.status(500).send("InternalServer Error..!")

    }
  }



  // function for user to send the OTP in the email 

  const sendOTPEmail = async(email,otp)=>{
    try{
        const mailOptions = {
            from : process.env.NODEMAILER_EMAIL,
            to : email,
            subject : "Alpha Books - Account Verification OTP",
            html : `<h3>Welcome to Alpha Books!</h3>
                   <p>Your OTP for account verification is: <b>${otp}</b></p>
                   <p>This OTP is valid for 2 minutes only.</p>` // 🌟 2 മിനിറ്റ് എന്ന് അപ്ഡേറ്റ് ചെയ്തിട്ടുണ്ട്
        }
        await transporter.sendMail(mailOptions)
        console.log(`OTP Email sucessfully send to ${email}`)

    }
    catch(error){
        console.log("Error in sending OTP email ",error.message)
        throw new Error("Failed to send OTP email")

    }
  }



  // function work when the user submit the signup form
   const postSignup = async(req,res)=>{
    try{
        const {firstName, lastName, email, password} = req.body  // take the details user typed from frontend

        // check if the email already exists
        const existingUser = await User.findOne({email})

        if(existingUser){

            return res.send("An account is already there in this email.! ")
        }

        const {otp, expiry} = generateOTP()   // generating new OTP and expiry for the new user

        // keep the generated otp and user data in the session
        req.session.userOtp = otp
        req.session.userData = {firstName, lastName, email, password}

        await sendOTPEmail(email, otp)   // sending otp to the user in email

        res.redirect('/otp-verify')


        console.log('this is the email came through form : ',email)


    }
    catch(error){
        console.log("Error in Postsignup",error.message)
        res.status(500).send("Internal Server Error")
    }
  }


  // function to render the otp verification page

  const loadOTP = async (req,res)=>{
    try{
            res.render('user/otpverify',{
            title : "Alpha Book - OTP Verification"
        })
    }
    catch(error){
        console.log("Error in loadOTP controller", error.message)
        res.status(500).send("Internal Server Error..!")

    }
}


// function to verify the OTP (post)

const postVerifyOTP = async (req,res)=>{
    try{
        const userOTP = req.body.otp   // get the otp input by the user

        // taking the actual OTP from the session
        const sessionOTP = req.session.userOtp
        const userData = req.session.userData
        const otpExpiry = req.session.otpExpiry  // take the expiry time from the session

    
        console.log("OTP typed by user in frontend:", userOTP);
        console.log("Actual OTP saved in session:", sessionOTP);


        // before matching the otp check the otp has expired
        if(!otpExpiry || new Date() > new Date(otpExpiry)){
            console.log("Verification Failed : OTP has expired")
            return res.send("OTP has expired ...! Please click Resend OTP")

        }

        // checking the both OTP matches
        if(userOTP === sessionOTP){     

            const newUser = new User({                // if OTP matches, save the new user in to the db
                firstName : userData.firstName,
                lastName : userData.lastName,
                email : userData.email,
                password : userData.password
            })

            await newUser.save()  // save user

            // clean the session

            req.session.userOtp = null
            req.session.userData = null

            console.log("User Successfulyy registerd in db")

            return res.redirect('/')   // if user is saved in db, redirect to the home page

        }
        else{
            return res.send("Invalid OTP ..! Please try again..")
        }
    
    }
    catch(error){
        console.log("Error in postVerifyOTP controller",error.message)
        res.status(500).send("Internal Server Error")

    }
}


  // function to load the login page

  const loadLogin = async(req,res)=>{
    try{
        res.render('user/login',{
            title : "Alpha Books - Login "
        })

    }
    catch(error){
        console.log("Error in loadLogin controller",error.message)
        res.status(500).send("Internal server")
    }
  }
    

  // function when user submit the login data (post)

  const postLogin = async(req,res)=>{
    try{
        const {email, password} = req.body

        // check the user typed email is in the db
        const user = await User.findOne({email : email})

        if(!user){
            return res.send("Invalid email or password..!")   // if user is not in the db, he cannot log in
        }

        // checking the user typed password with the password registered in the db
        if(user.password !== password){
            return res.send("Invalid email or Password..!")
        }

        // if everything is correct, save the user in the session
        req.session.user = user

        console.log("user successfully logged in")

        // if login success - user redirect to home page
        return res.redirect('/')

    }
    catch(error){
        console.log("Error in postLogin",error.message)
        res.status(500).send("Internal Server Error")
    }
  }
  

  // function to user logout

  const logout = async(req,res)=>{
    try{
        req.session.destroy((err)=>{
            if(err){
                console.log("Error destroying Session",err.message)
                return res.status(500).send("Logout Failed..!")
            }
            console.log("user logout")
            res.redirect('/login')     // redirecting to login after successfully destroying the session
        })
    }
    catch(error){
        console.log("Error in logout controller", error.message)
        res.status(500).send("internalServer Error")
    }
  }


  // function to resend OTP

  const resendOTP = async (req,res)=>{
    try{
        const userData = req.session.userData    // check the user data (signup data) is in the session

        if(!userData){
            return res.redirect('/signup')    // if the user is session out redirect to signup page

        }

        // create new otp and expiry

        const {otp, expiry} = generateOTP()

        req.session.userOtp = otp    // update the new otp in the session

        await sendOTPEmail(userData.email, otp)  // send the otp to the user via email

        console.log("new OTP resend to the email",userData.email)

        res.redirect('/otp-verify')
    }
    catch(error){
        console.log("Error in resendOTP controller", error.message)
        res.status(500).send("Internal Server Error")
    }
  }






export default {
    loadHome,
    loadSignUp,
    generateOTP,
    sendOTPEmail,
    postSignup,
    loadOTP,
    postVerifyOTP,
    loadLogin,
    postLogin,
    logout,
    resendOTP,

}