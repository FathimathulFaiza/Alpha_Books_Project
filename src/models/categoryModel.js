
import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : true,
        unique : true,
        trim : true
    },
    description : {
        type : String,
        required : true
    },
    isActive : {      // soft delete 
        type : Boolean,      // category is visible to users
        default : true
    },


},{timestamps : true}
) 


const Category = mongoose.model("Category",categorySchema)

export default Category
