
import User from "../models/userModel.js"

export const isUser = async (req,res,next)=>{

    console.log("--- Debugging isUser Middleware ---");
    console.log("Session User:", req.session.user);
    console.log("Passport User (req.user):", req.user);

    const user = req.session.user || req.user     // storing the user in the session - manual and google logged in 

    if(!user){
        return res.redirect('/login')
    }

    const userId = user._id || user.id
    console.log("Target User ID:", userId);
    
    const userData = await User.findById(userId)

    if(!userData){

        req.session.destroy()
        return res.redirect('/login')
    }

    if(userData.isBlocked === true){      // if the user is blocked , destroy the the session

       req.session.destroy()

       return res.redirect('/login?blocked=true')
    }

    next()

}