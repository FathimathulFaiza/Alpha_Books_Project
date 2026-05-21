import nodemailer from 'nodemailer'
import User from '../models/userModel.js'
import bcrypt from 'bcrypt'



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
     if(req.session.user){
        return res.redirect('/')  // if the user is already logged in do not show signup page , redirect to home page
     }

     res.render('user/signup')   // if not logged in show signup page
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
        req.session.otpExpiry = expiry
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
            const error = req.query.error || null      // if otp expire or any error, it takes from url or if no error it is null

            res.render('user/otpverify',{
            title : "Alpha Book - OTP Verification",
            error : error
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


        // before matching the otp check the otp has expired , if yes redirect to the verify otp page again
        if(!otpExpiry || new Date() > new Date(otpExpiry)){
            console.log("Verification Failed : OTP has expired")
            return res.redirect('/otp-verify?error=OTP has expired..! Please Click Resend OTP.')

        }

        // checking the both OTP matches
        if(userOTP === sessionOTP){     

            const hashedPassword = await bcrypt.hash(userData.password, 10) // saltround -10

            const newUser = new User({                // if OTP matches, save the new user in to the db
                firstName : userData.firstName,
                lastName : userData.lastName,
                email : userData.email,
                password : hashedPassword
            })

            await newUser.save()  // save user

            // clean the session

            req.session.userOtp = null
            req.session.userData = null
            req.session.otpExpiry = null

            console.log("User Successfulyy registerd in db")

            return res.redirect('/')   // if user is saved in db, redirect to the home page

        }
        else{
            return res.redirect('/otp-verify?error=Invalid OTP..! Please try again..')    // otp is incorrect, redirect to otp-page with error message
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
        if(req.session.user){       // if the user is already logged in, show the home page - without showing login page
            return res.redirect('/')
        }
        res.render('user/login')      // if the user is not logged in show the login page
      
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


        // compare the plain pssword with hashed password in db
        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if(!isPasswordMatch){
            return res.send("Invalid email or Password..!!")
        }

        // if everything is correct, save the user in the db
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
        req.session.destroy((err)=>{    // destroy the session
            if(err){
                console.log("Error destroying Session",err.message)
                return res.redirect('/')
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
        req.session.otpExpiry = expiry     // keep the expiry time in the session
        

        await sendOTPEmail(userData.email, otp)  // send the otp to the user via email

        console.log("new OTP resend to the email",userData.email)

        res.redirect('/otp-verify')
    }
    catch(error){
        console.log("Error in resendOTP controller", error.message)
        res.status(500).send("Internal Server Error")
    }
  }


  // function to render forgot password page

  const loadForgotPassword = async(req,res)=>{
    try{
        const error = req.query.error || null

        res.render('user/forgotpassword',{
            title : "Alpha Books - Forgot Password",
            error : error,
            message : null
        })

    }
    catch(error){
        console.log("Error in loadForgotPassword controller")
        res.status(500).send("Internal Server Error")
    }
  }

 
  // function to check the user typed email in the db (post)

  const postForgotPassword = async(req,res)=>{
    try{
        const {email} = req.body

        const user = await User.findOne({email : email})   // searching in db wheather this email is already registerd

        if(!user){   // new user - not registered 
            return res.redirect('/forgot-password?error=This email is not registered..!')
        }

// generating new otp and save in the session,also send mail along with
        const {otp,expiry} = generateOTP()

        req.session.forgotOtp = otp
        req.session.forgotEmail = email

        await sendOTPEmail(email, otp)   // sending mail to the user

        console.log("user who comes to reset password",user.email)

       req.session.forgotEmail = email

       return res.redirect('/forgot-password-otp');  // redirect to this page

    }
    catch(error){
        console.log("Error in postForgotPassword controller",error.message)
        res.status(500).send("Internal Server Error")
    }
  }


  // function to render the forgot password-otp page

    const  loadForgotPasswordOTP = async(req,res)=>{
        try{
            if(!req.session.forgotEmail){
                return res.redirect('/forgot-password')
            }

            const error = req.query.error || null

            res.render('user/forgotOtp',{
                title : "Alpha Books - Enter OTP",
                error : error,
                message : null
            })

        }
        catch(error){
            console.log("Error in loadForgotPaswordOTP controller",error.message)
            res.status(500).send("Internal Server Error")
    }
  }


  // function to verify the otp given by the user (post)

  const verifyForgotPasswordOTP = async(req,res)=>{
    try{
       const otp = req.body.otp     // get the 6  digit otp as string

        // actual otp saved in the session
        const savedOtp = req.session.forgotOtp;

        console.log("user otp : ",otp)
        console.log("actual otp : ",savedOtp)

        // check both otp's are same

        if(otp === savedOtp){
            console.log("OTP verification success")

            return res.redirect('/reset-password')
        }
        else{                // if otp doesnt match
            console.log("OTP is wrong..!")

            return res.render('user/forgotOtp',{
                error : "Invalid OTP ! Please check and try again"
            })
        }
    }
    catch(error){
        console.log("Error in verifyForgotPasswordOTP controller", error.message)
        res.status(500).send("InternalServer Error")
    }
  }


  // function to render the reset password page (get)

  const loadRestPassword = async(req,res)=>{
    try{
      if(!req.session.forgotEmail){
        return res.redirect('/forgot-password')
      }

      const error = req.query.error || null

      res.render('user/reset-password',{
        title : "Alpha Books - Reset Password",
        error : error
      })

    }
    catch(error){
        console.log("Error in loadResetPassword controller",error.message)
        res.status(500).send("Internal Server Error")
    }
  } 


  // function to recieve the new password and update in the db

  const postResetPassword = async (req,res)=>{
    try{
        const {password, confirmPassword} = req.body   // get the plain password from form

        const email = req.session.forgotEmail     // get the verified email from session

        if(!email){      //  Security check: If session expired or email is missing, send them back to start again
            return (res.redirect('/forgot-password'))
        }

        if(password !== confirmPassword){
            return res.redirect('/reset-password?error=Password do not match..!')
        }

        // hash the password before saving to db
        const hashedPassword = await bcrypt.hash(password,10)   //saltround - 10

        // changing the hashed password of the email of this user
        await User.findOneAndUpdate({email : email},{password : hashedPassword})

        console.log("password Successfully updated for the user : ",email)


        // clear the session data after completing everything
        req.session.forgotEmail = null
        req.session.forgotOtp = null


        // redirect to login page after successfully changing the password
        return res.redirect('/login')
    }

    catch(error){
        console.log("Error in postResetPassword controller",error.message)
        res.status(500).send("Internal Server Error")
    }
  }

  // function to load the user profile page
  const loadProfile = async(req,res)=>{
    try{
        const userId = req.session.user ? req.session.user._id : null

        if(!userId){
            return res.redirect('/login')  // if user not logged in
        }

        // fetch the complete the user details from db using ID
        const user = await User.findById(userId)

        if(!user){
            return res.redirect('/login')
        }

        res.render('user/profile', {user : user})

    }
    catch(error){
        console.log("Error in loadProfile controller",error.message)
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
    loadForgotPassword,
    postForgotPassword,
    loadForgotPasswordOTP,
    verifyForgotPasswordOTP,
    loadRestPassword,
    postResetPassword,
    loadProfile,


}