
import mongoose from "mongoose"


// seperate schema for address schema -> it is relared to user
const addressSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String },
    mobile: { type: String, required: true },
    addressLine: { type: String, required: true },
    cityOrDistrict: { type: String, required: true },
    state: { type: String, required: true },
    landmark: { type: String },
    pincode: { type: String, required: true },
    addressType: { type: String, default: "Home" },
    isDefault: { type: Boolean, default: false }
});




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
        required : function (){
            return !this.isGoogleUser
        } 
    },

    isGoogleUser : {
        type : Boolean,
        default : false
    },
    
    phone: { 
        type: String, 
        default: "" 
        
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
    },

    addresses : [addressSchema],

    profileImage: {
        type: String,
        default: '/images/default-avatar.png' // default avatar
    },

},{timestamps : true}
)

const User = mongoose.model("User", userSchema)

export default User 