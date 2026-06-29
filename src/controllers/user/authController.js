
import nodemailer from 'nodemailer'
import User from '../../models/userModel.js' 
import bcrypt from 'bcrypt'
import {generateOTP, sendOTPEmail} from'../../utils/otpUtils.js'



// function to user sign up
export const loadSignUp = async (req, res) => {
    try {
        if (req.session.user) {
            return res.redirect('/')  // if the user is already logged in do not show signup page , redirect to home page
        }

        const error = req.query.error || null    // if error in the url it takes , or else null

        res.render('user/signup', { error: error })   // if not logged in show signup page
    }
    catch (error) {
        console.log("Error in loadSignUp controller", error.message)
        res.status(500).send("InternalServer Error..!")
    }
}



// function work when the user submit the signup form
export const postSignup = async (req, res) => {
    try {
        const { firstName, lastName, phone, email, password, confirmPassword } = req.body  // take the details user typed from frontend

     

        // password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if(!passwordRegex.test(password)){
            return res.redirect('/signup?error=Password must be 8+ characters, including uppercase, lowercase, number & symbol')
        }

           if(password !== confirmPassword){
            return res.redirect('/signup?error=password and confirm password must be same..!')
        }

        // check if the email already exists
        const existingUser = await User.findOne({ email })

        if (existingUser) {    // if already an email account in this email
            return res.redirect('/signup?error=An account already exists with this email')
        }

        const { otp, expiry } = generateOTP()   // generating new OTP and expiry for the new user

        // keep the generated otp and user data in the session
        req.session.userOtp = otp
        req.session.otpExpiry = expiry
        req.session.userData = { firstName, lastName, phone, email, password }

        await sendOTPEmail(email, otp)   // sending otp to the user in email

        res.redirect('/otp-verify')
        console.log('this is the email came through form : ', email)
    }
    catch (error) {
        console.log("Error in Postsignup", error.message)
        res.status(500).send("Internal Server Error")
    }
}

// function to render the otp verification page
export const loadOTP = async (req, res) => {
    try {
        const error = req.query.error || null      // if otp expire or any error, it takes from url or if no error it is null

        res.render('user/otp-verify', {
            title: "Alpha Book - OTP Verification",
            error: error
        })
    }
    catch (error) {
        console.log("Error in loadOTP controller", error.message)
        res.status(500).send("Internal Server Error..!")
    }
}

// function to verify the OTP (post)
export const postVerifyOTP = async (req, res) => {
    try {
        const userOTP = req.body.otp   // get the otp input by the user

        // taking the actual OTP from the session
        const sessionOTP = req.session.userOtp
        const userData = req.session.userData
        const otpExpiry = req.session.otpExpiry  // take the expiry time from the session

        if (!userData) {
            console.log("Verification Failed..! No User data found in the session ")  // if session expires, no userData.so check userdata in the session
            return res.redirect('/signup?error=Session Expired.Please register again..')
        }

        console.log("OTP typed by user in frontend:", userOTP);
        console.log("Actual OTP saved in session:", sessionOTP);

        // before matching the otp check the otp has expired , if yes redirect to the verify otp page again
        if (!otpExpiry || new Date() > new Date(otpExpiry)) {
            console.log("Verification Failed : OTP has expired")
            return res.redirect('/otp-verify?error=OTP has expired..! Please Click Resend OTP.')
        }

        // checking the both OTP matches
        if (userOTP === sessionOTP) {
            const hashedPassword = await bcrypt.hash(userData.password, 10) // saltround -10

            const newUser = new User({                // if OTP matches, save the new user in to the db
                firstName: userData.firstName,
                lastName: userData.lastName,
                email: userData.email,
                password: hashedPassword,
                phone : userData.phone
            })

            await newUser.save()  // save user

            req.session.user = newUser  // login from here itself 

            // clean the session
            req.session.userOtp = null
            req.session.userData = null
            req.session.otpExpiry = null

            console.log("User Successfulyy registerd in db")
            return res.redirect('/')   // if user is saved in db, redirect to the home page
        }
        else {
            return res.redirect('/otp-verify?error=Invalid OTP..! Please try again..')    // otp is incorrect, redirect to otp-page with error message
        }
    }
    catch (error) {
        console.log("Error in postVerifyOTP controller", error.message)
        res.status(500).send("Internal Server Error")
    }
}

// function to load the login page
export const loadLogin = async (req, res) => {
    try {
        if (req.session.user) {       // if the user is already logged in, show the home page
            return res.redirect('/')
        }

        const error = req.query.error || null     // if error in the url
        res.render('user/login', { error: error })      // if the user is not logged in show the login page
    }
    catch (error) {
        console.log("Error in loadLogin controller", error.message)
        res.status(500).send("Internal server")
    }
}

// function when user submit the login data (post)
export const postLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        // check the user typed email is in the db
        const user = await User.findOne({ email: email })

        console.log("Found User Data in DB:", user);

        if (!user) {
            return res.redirect('/login?error=Invalid email or password..!')
        }

        // check if the user is blocked by the admin , shows error message 
        if(user.isBlocked){
            return res.redirect('/login?error=Your Account has been Blocked by Admin..!')
        }

        // compare the plain password with hashed password in db
        const isPasswordMatch = await bcrypt.compare(password, user.password)

        if (!isPasswordMatch) {   // if password is incorrect
            return res.redirect('/login?error=Invalid email or password..!')
        }

        // if everything is correct, save the user in the session
        req.session.user = user
        console.log("user successfully logged in")

        return res.redirect('/')
    }
    catch (error) {
        console.log("Error in postLogin", error.message)
        res.status(500).send("Internal Server Error")
    }
}

// function to user logout
export const logout = async (req, res) => {
    try {
        req.session.destroy((err) => {    // destroy the session
            if (err) {
                console.log("Error destroying Session", err.message)
                return res.redirect('/')
            }
            console.log("user logout")
            res.redirect('/login')     // redirecting to login after successfully destroying the session
        })
    }
    catch (error) {
        console.log("Error in logout controller", error.message)
        res.status(500).send("internalServer Error")
    }
}

// function to resend OTP
export const resendOTP = async (req, res) => {
    try {
        const userData = req.session.userData    // check the user data (signup data) is in the session

        if (!userData) {
            return res.redirect('/signup')    // if the user is session out redirect to signup page
        }

        // create new otp and expiry
        const { otp, expiry } = generateOTP()

        req.session.userOtp = otp    // update the new otp in the session
        req.session.otpExpiry = expiry     // keep the expiry time in the session

        await sendOTPEmail(userData.email, otp)  // send the otp to the user via email
        console.log("new OTP resend to the email", userData.email)

        res.redirect('/otp-verify')
    }
    catch (error) {
        console.log("Error in resendOTP controller", error.message)
        res.status(500).send("Internal Server Error")
    }
}


// function to resend forgot password OTP while login

export const resendForgotPasswordOTP = async(req,res)=>{
    try{
        const forgotEmail = req.session.forgotEmail     // taking forgotEmail from the session

        if(!forgotEmail){
            return res.redirect('/forgot-password')
        }

        const {otp, expiry} = generateOTP()

        req.session.forgotOtp = otp
        req.session.forgotOtpExpiry = expiry     // saving new values to the session - forgotOtp & forgotOtpExpiry

        await sendOTPEmail(forgotEmail, otp)     // sending the email function

        res.redirect('/forgot-password-otp')

    }
    catch(error){
        console.log("Error in resendForgotPasswordOTP controller ",error)
        res.status(500).send("Internal Server Error")
    }
}



// function to render forgot password page
export const loadForgotPassword = async (req, res) => {
    try {
        const error = req.query.error || null

        res.render('user/forgotpassword', {
            title: "Alpha Books - Forgot Password",
            error: error,
            message: null
        })
    }
    catch (error) {
        console.log("Error in loadForgotPassword controller")
        res.status(500).send("Internal Server Error")
    }
}

// function to check the user typed email in the db (post)
export const postForgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        const user = await User.findOne({ email: email })

        if (!user) {   // new user - not registered 
            return res.redirect('/forgot-password?error=This email is not registered..!')
        }

        // generating new otp and save in the session
        const { otp, expiry } = generateOTP()

        req.session.forgotOtp = otp
        req.session.forgotOtpExpiry = expiry
        req.session.forgotEmail = email

        await sendOTPEmail(email, otp)   // sending mail to the user
        console.log("user who comes to reset password", user.email)

        return res.redirect('/forgot-password-otp');  // redirect to this page
    }
    catch (error) {
        console.log("Error in postForgotPassword controller", error.message)
        res.status(500).send("Internal Server Error")
    }
}

// function to render the forgot password-otp page
export const loadForgotPasswordOTP = async (req, res) => {
    try {
        if (!req.session.forgotEmail) {
            return res.redirect('/forgot-password')
        }

        const error = req.query.error || null

        res.render('user/forgotOtp', {
            title: "Alpha Books - Enter OTP",
            error: error,
            message: null
        })
    }
    catch (error) {
        console.log("Error in loadForgotPaswordOTP controller", error.message)
        res.status(500).send("Internal Server Error")
    }
}

// function to verify the otp given by the user (post)
export const verifyForgotPasswordOTP = async (req, res) => {
    try {
        const otp = req.body.otp     // get the 6 digit otp as string

        // actual otp saved in the session
        const savedOtp = req.session.forgotOtp;
        const expiry = req.session.forgotOtpExpiry

        console.log("user otp : ", otp)
        console.log("actual otp : ", savedOtp)

        // check the otp is valid or expired before matching
        if (!expiry || new Date() > new Date(expiry)) {
            console.log("Verification Failed : Forgot Password OTP has expired..!")
            return res.redirect('/forgot-password-otp?error=OTP has expired ..! Please Request New One..')
        }

        // check both otp's are same
        if (otp === savedOtp) {
            console.log("OTP verification success")
            return res.redirect('/reset-password')
        }
        else {                // if otp doesnt match
            console.log("OTP is wrong..!")
            return res.redirect('/forgot-password-otp?error=Invalid OTP ! Please check and try again..')
        }
    }
    catch (error) {
        console.log("Error in verifyForgotPasswordOTP controller", error.message)
        res.status(500).send("InternalServer Error")
    }
}

// function to render the reset password page (get)
export const loadResetPassword = async (req, res) => {
    try {
        if (!req.session.forgotEmail) {
            return res.redirect('/forgot-password')
        }

        const error = req.query.error || null

        res.render('user/reset-password', {
            title: "Alpha Books - Reset Password",
            error: error
        })
    }
    catch (error) {
        console.log("Error in loadResetPassword controller", error.message)
        res.status(500).send("Internal Server Error")
    }
}

// function to recieve the new password and update in the db
export const postResetPassword = async (req, res) => {
    try {
        const { password, confirmPassword } = req.body   // get the plain password from form
        const email = req.session.forgotEmail     // get the verified email from session

        if (!email) {      // Security check
            return (res.redirect('/forgot-password'))
        }

        if (password !== confirmPassword) {    // password match check
            return res.redirect('/reset-password?error=Password do not match..!')
        }

        // password validation
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

        if(!passwordRegex.test(password)){
            return res.redirect('/reset-password?error=Passsword must be 8+ characers, nclude uppercase, lowercase, number & symbol')
        }

        //check the old password
        const user = await User.findOne({email : email})

        // checking the new hashed password with old hashed password
        const isSamePassword = await bcrypt.compare(password, user.password)

        if(isSamePassword){
            return res.redirect('/reset-password?error=You cannot use old password. Please choose a new one')
        }


        // hash the password before saving to db
        const hashedPassword = await bcrypt.hash(password, 10)

        // changing the hashed password of the email of this user
        await User.findOneAndUpdate({ email: email }, { password: hashedPassword })
        console.log("password Successfully updated for the user : ", email)

        // clear the session data after completing everything
        req.session.forgotEmail = null
        req.session.forgotOtp = null

        return res.redirect('/login')
    }
    catch (error) {
        console.log("Error in postResetPassword controller", error.message)
        res.status(500).send("Internal Server Error")
    }
}

