
 import express from "express";
 import userRouter from "./routes/userRouter.js"
 import adminRouter from "./routes/adminRouter.js"

 const app = express()

 import path from "path"
 import { fileURLToPath } from "url"

 const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

 app.use(express.static(path.join(__dirname, "../public")));

 app.set("view engine","ejs")   // view engine
 app.set("views","src/views")

 app.use(express.json())  // middleware
 app.use(express.urlencoded ({extended : true}))
 


// // session
 import session from "express-session";
 
 app.use(
 session({
    secret: "alpha-books-admin-secret",
    resave: false,
    saveUninitialized: true,
   }) );


//  routers

 app.use("/",userRouter)
app.use("/admin",adminRouter)




export default app