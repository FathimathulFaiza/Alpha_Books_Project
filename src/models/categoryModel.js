
import mongoose from "mongoose"

const categorySchema = new mongoose.Schema({
    name : {
        type : String,
        required : [true, "Category name is required"],
        unique : true,
        trim : true,
        minLength : [2, "Category name must be atleat 2 characters long.!"],
        maxLength : [50, "Category name cannot be exceed 50 characters.!"]
    },
    slug : {
        type : String,
        required : true,
        unique : true,
        lowercase : true,
        trim : true
    },
    description : {
        type : String,
        required : [true,"Category description is required"],
        trim : true,
        maxLength : [500,"Description cannot exceed 500 characters"]
    },
    isListed : {
        type : Boolean,
        default : true,    // toggle button
    },
},
{timestamps : true}
) 

categorySchema.index({name : 1,slug : 1})     // indexing for increase the search speed

const Category = mongoose.model("Category",categorySchema)

export default Category
