
import mongoose from "mongoose"
import { type } from "os"


const userSchema = new mongoose.Schema({
    firstName :{
        type : String,
        required : true
    },
      lastName :{
        type : String,
        required : true
    },
    email : {
        type : String,
        required : true,
        unique : true
    },
    password : {
        type : String,
        required : true
    },
    isAdmin : {
        type : Boolean,
        default : false
    },
    isBlocked : {
        type : Boolean,
        default : false
    },
    isVerified : {
        type : Boolean,
        default : false
    },
    emailOtpCode : {
        type : String
    },
    emailOtpExpiry : {
        type : Date
    }

},{timestamps : true}
)

const User = mongoose.model("User", userSchema)

export default User 