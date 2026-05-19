
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


//  routers

 app.use("/",userRouter)
 app.use("/admin",adminRouter)




export default app