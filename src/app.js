
 import express from "express";
 import session from "express-session";
 import userRouter from "./routes/userRouter.js"
 import adminRouter from "./routes/adminRouter.js"
 import path from "path"
 import { fileURLToPath } from "url"

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


   // middleware to get the data of the user in all ejs pages
   app.use((req,res,next)=>{
    res.locals.user = req.session.user || null;  // if user is logged in pass data to ejs, or else set null
    next()
   })

//  routers

 app.use("/",userRouter)
 app.use("/admin",adminRouter)


 // middleware to get the navbar for all the pages for logged in user

 app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    next();
});

export default app