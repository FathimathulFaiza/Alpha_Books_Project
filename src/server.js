
import dotenv from "dotenv";
import app from "./app.js"
import connectDB from "./config/database.js";
import session from "express-session";

app.use(session({
    secret : 'alpha_books_secret_key',
    resave : false,
    saveUninitialized : true,
    cookie : { 
        maxAge : 1000 * 60 * 60 * 24}    // session valid for 24hrs 
}))

dotenv.config()


const PORT = process.env.PORT || 3000

connectDB()



app.listen(PORT, ()=>{
    console.log(`Alpha Book Server Running On Port ${PORT}`)
    console.log(PORT)
})


