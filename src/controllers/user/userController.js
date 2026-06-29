
import User from '../../models/userModel.js' 
import bcrypt from 'bcrypt'

import { sendOTPEmail, generateOTP} from '../../utils/otpUtils.js'





// 1. Home Page Loading
export const loadHome = async (req, res) => {
    try {
        const userSession = req.user || req.session.user

        res.render('user/home', { title: "Alpha Books - Home",
            user : userSession || null
         })

    } catch (error) {
        console.log("Error in home load controller", error.message)
        res.status(500).send("Internal Server Error..!")
    }
}



// 2. Profile View & Edit
export const loadProfile = async (req, res) => {
    try {
        const userSession = req.user || req.session.user 

        if (!userSession)
        return res.redirect('/login')


        // takig the updated user data from db
        const user = await User.findById(userSession._id)

        if(!user){
            return res.redirect('/login')
        }


        // taking the 'isDefault:true' address from other address
        const primaryAddress = user.addresses.find(addr => addr.isDefault === true)

        console.log("All User Addresses:", user.addresses); 
console.log("Found Primary Address:", primaryAddress);

        res.render('user/profile', {
            user,
            primaryAddress,
            message: req.query.message || null,
            error: req.query.error || null
        })
    } catch (error) {
        console.log("Error in loadProfile controller", error.message)
        res.status(500).send("Internal Server Error")
    }
}



export const loadEditProfile = async (req, res) => {
    try {
        const userSession = req.user || req.session.user

        if (!userSession){
             return res.redirect('/login')
        }

        const user = await User.findById(userSession._id)
        res.render('user/edit-profile', {
            title: "Alpha Books - Edit Profile",
            user,
            error: req.query.error || null,
            message: req.query.message || null
        })

    } catch (error) {
        console.log("Error in loadEditProfile", error.message)
        res.status(500).send("Internal Server Error")
    }
}



export const postEditProfile = async (req, res) => {
    try {
        const userSession = req.user || req.session.user

        if (!userSession) 
        return res.redirect('/login')

        const { firstName, lastName, mobile } = req.body

        console.log("Saving user profile data:", { firstName, lastName, mobile });

        const updatedUser = await User.findByIdAndUpdate(
            userSession._id,
           {$set : { firstName, lastName, mobile }},
            { new: true }
        )
        req.session.user = updatedUser   // updating user details in session

        return res.redirect('/profile?message=Profile Updated Successfully..')
    } catch (error) {
        console.log("Error in postEditProfile controller", error.message)
        res.status(500).send("Internal Server error")
    }
}


// 3. Password Management (While Logged In)
export const loadChangePassword = async (req, res) => {
    try {
        const userSession = req.user || req.session.user

        if (!userSession) 
            return res.redirect('/login')

        const user = await User.findById(userSession._id)

        if(user.isGoogleUser){
            return res.redirect('/profile?error=Google users cannot change password..!')
        }


        res.render('user/change-password', {
            title: "Alpha Books - Change Password",
            error: req.query.error || null,
            message: req.query.message || null
        })

    } catch (error) {
        console.log("Error in loadChangePassword controller", error.message)
        res.status(500).send("Internal Server Error")
    }
}


export const postChangePassword = async (req, res) => {
    try {
        const userSession = req.user || req.session.user

        if (!userSession) 
            return res.redirect('/login')

        const user = await User.findById(userSession._id)

        if(user.isGoogleUser){
            return res.redirect('/profile?error=Google users cannot change password')
        }

        const { currentPassword, newPassword, confirmPassword } = req.body

        
        const isPasswordMatch = await bcrypt.compare(currentPassword, user.password)
        if (!isPasswordMatch) {
            return res.redirect('/change-password?error=Current Password is Incorrect..!')
        }

        if (newPassword !== confirmPassword) {
            return res.redirect('/change-password?error=New Passwords do not Match..!')
        }

        user.password = await bcrypt.hash(newPassword, 10)
        await user.save()

        return res.redirect('/profile?message=Password Changed Successfully..')
    } catch (error) {
        console.log("Error in postChangePassword Controller", error.message)
        res.status(500).send("Internal server error")
    }
}

           

// 5. Change Email Management
export const loadChangeEmail = async (req, res) => {
    try {
        const userSession = req.user || req.session.user 

        if (!userSession)
             return res.redirect('/login')

        res.render('user/change-email', {
            title: "Alpha Books - change email",
            error: req.query.error || null,
            message: req.query.message || null
        })

    } catch (error) {
        console.log("Error in loadChangeEmail controller", error.message)
        res.status(500).send("Internal server Error")
    }
}


// controller to change email
export const postChangeEmail = async (req, res) => {
    try {
        const userSession = req.user || req.session.user

        if (!userSession) 
            return res.redirect('/login')

        const { newEmail } = req.body
        const currentemail = userSession.email

        if (currentemail === newEmail) {
            return res.redirect('/profile?error=This is already your current email address..!')
        }

        const emailExists = await User.findOne({ email: newEmail })
        if (emailExists) {
            return res.redirect('/profile?error=email is already registered with another account! ')
        }

        const { otp, expiry } = generateOTP()
        req.session.emailUpdateTemp = { newEmail, otp, expiry }     // storing newEmail, otp, expiry in the session temporarly

       
        await sendOTPEmail(newEmail, otp)    // sending mail through the sendOTPEmail fun inside authcontroller file

        console.log("Email update OTP generated successfully for: ", newEmail)
        return res.redirect('/change-email-verify')
    } catch (error) {
        console.log("Error in changeEmail controller", error.message)
        res.status(500).send("Internal server Error")
    }
}


// controller to render the 6 digit otp verification page
export const loadChangeEmailVerify = async (req,res)=>{
    try{
        const userSession = req.user || req.session.user

        if(!userSession){
            return res.redirect('/login')    // check if the user is logged and in the session
        }


        if(!req.session.emailUpdateTemp){
            return res.redirect('/profile')
        }

        res.render('user/change-email-verify', {title : "OTP Verification", error : null} )

    }
    catch(error){
        console.log("error on loadChangeEmailVerify controller", error)
        res.status(500).send("Internal Server Error")
    }
}


// controller to verify the otp typed by the user and update new email
export const postChangeEmailVerify = async(req,res)=>{
    try{
        const userSession = req.user || req.session.user


        if(!userSession){
            return res.redirect('/login')    // check user is logged in
        }

         const {otp} = req.body   // taking the user typed otp from req.body

        if(!req.session.emailUpdateTemp){     // check temporary otp stored in the session
           return res.redirect('/profile')
        }

        // otp expiry check
        if(new Date() > new Date(req.session.emailUpdateTemp.expiry))

            return res.render('user/change-email-verify' , {
                title : "OTP Verification",
                error : "OTP Expired. Please request a new one"
            })


            // otp matching
        if(req.session.emailUpdateTemp.otp !== otp){    // check computer generated otp & typed otp are correct, 

            return res.render('user/change-email-verify', {        // if not, render the otp page again
                title : "OTP Verification",
                error : "Invalid OTP . Please try again..!"
            })
        }

        // if everything is correct, update the older email to new email of the currect user in db

        const updateUser = await User.findByIdAndUpdate(
            userSession._id,
            {email : req.session.emailUpdateTemp.newEmail},
            {new : true}
        )

        req.session.user = updateUser      // update the user in the session also with new email

        delete req.session.emailUpdateTemp     // delete the data of email stored in the session temporarly
        console.log("email changes updated ")

        return res.redirect('/profile?message=Email Updated Successfully.!')     // redirect the user to the profile page succesfully

    }
    catch(error){
        console.log("Error in postChangeEmailVerify controller",error)
        res.status(500).send("Internal Server Error")
    }
}


// resend otp function for changing the email of logged in user

export const resendEmailOtp = async(req,res)=>{
    try{
        const userSession = req.user || req.session.user

        if(!userSession){
            return res.redirect('/login')     // check user is logged in
        }

        if(!req.session.emailUpdateTemp){
            return res.redirect('/profile')     // check new email is temporarly saved in the session
        }

        const newEmail = req.session.emailUpdateTemp.newEmail     // take newEmail stored from session

        const{otp, expiry} = generateOTP()

        req.session.emailUpdateTemp.otp = otp             // saving the otp and expiry in the session 
        req.session.emailUpdateTemp.expiry = expiry

         await sendOTPEmail(newEmail, otp)      // sending otp to new email

        console.log("New OTP sent to : ",newEmail)

        return res.redirect('/change-email-verify')      // redirecting to otp verification page

    }
    catch(error){
        console.log("Error in resendEmailOtp controller",error)
        res.status(500).send("Internal Server Error")
    }
}



// upload profile Image

export const uploadProfileImage = async(req,res)=>{
    try{
        if(!req.file){
            return res.redirect('/profile?error=Please Select an Image first..!')
        }

        const userSession = req.user || req.session.user

        if (!userSession) {
            return res.redirect('/login'); // check user is logged in
        }


        const imagePath = req.file.path.replace('public','')    // saving the image path to a variable

        // updating the user by finding the id and profile image in db

        const userId = userSession._id   // taking the userid from session

        console.log("Current User Session ID:", userId);



       const updatedUser = await User.findByIdAndUpdate(
        userId, 
        {$set :{profileImage : imagePath}},   // updating the prfile img
        {new : true}
    )   

    req.session.user = updatedUser
    
       console.log("Updated User:", updatedUser)

        res.redirect('/profile?message=Profile Image updated successfully')

    }
    catch(error){
        console.log("Error in uploadProfileImage Controller", error)
        res.status(500).send("Internal Server Error")
    }
}



