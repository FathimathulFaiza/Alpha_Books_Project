
 import express from "express";
 import session from "express-session";
 import userRouter from "./routes/userRouter.js"
 import adminRouter from "./routes/adminRouter.js"
 import path from "path"
 import { fileURLToPath } from "url"
 import './config/passport.js' // google auth
 import passport from "passport";

 const app = express()



 const __filename = fileURLToPath(import.meta.url)
 const __dirname = path.dirname(__filename)

 app.use(express.static(path.join(__dirname, "../public")));   // static files

 app.set("view engine","ejs")   // view engine
 app.set("views","src/views")

 app.use(express.json())  // middleware
 app.use(express.urlencoded ({extended : true}))   // body parser - to get form data
 

// session
  app.use(
 session({
    secret: "alpha-books-admin-secure-ket-2026",
    resave: false,
    saveUninitialized: true,
    cookie : {
      maxAge : 1000 * 60 * 60 * 24      // 24 hrs validity
    }
   }) );


 app.use(passport.initialize())
 app.use(passport.session())



   // middleware to get the data of the user in all ejs pages
   app.use((req,res,next)=>{
    res.locals.user = req.session.user || req.user ||  null;  // if user is logged in pass data to ejs, or else set null
    next()

    // res.locals.user -> google auth user
    // req.session.user -> normal logged in user
   })

//  routers

 app.use("/",userRouter)
 app.use("/admin",adminRouter)




export default app