
import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true
    },
    description : {
        type : String,
        required : true
    },
    isListed : {
        type : Boolean,      // category is visible to users
        default : true
    },


},{timestamps : true}
) 


const Category = mongoose.model("Category",categorySchema)

export default categorySchema