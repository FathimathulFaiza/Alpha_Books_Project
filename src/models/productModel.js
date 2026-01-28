
import mongoose from "mongoose"

const productSchema = new mongoose.Schema({
    title : {
        type : String,
        required : true
    },
    author : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    price : {
        type : Number,
        required : true
    },
    stock : {
        type : Number,
        required : true,
        default : 0
    },
    images : {
        type : [String],
        required : true
    },
    category : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "Category",
        required : true
    },
    isActive : {
        type : Boolean,
        default : true
    }

},{timestamps : true}
)


const Product = mongoose.model("Product", productSchema)

export default Product
