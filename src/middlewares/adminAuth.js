
export const isLogin = async (req,res,next)=>{

    try{
        res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
        
        if(req.session.admin_id){
          
            next()            // if admin in the 'session' -> move to next page
        }
        else{
        
            res.redirect('/admin/login')      // else redirect to 'login' page
        }
    }
    catch(error){
        console.log("Error in isLogin Middleware",error.message)
        res.status(500).send("Internal Server Error")
    }
}



export const isLogout = async (req,res,next) =>{

    try{
        if(req.session.admin_id){
            res.redirect('/admin/dashboard')   // if admin is logged in redirect to dashboard page
        }
        else{
            next()
        }
    }
    catch(error){
        console.log("Error in isLogoput middleware ",error.message)
        res.status(500).send("Internal Server Error")
    }
}