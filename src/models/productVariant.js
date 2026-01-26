
import mongoose from "mongoose"

const productVariantschema = new mongoose.Schema({

    product : {
        type : mongoose.Schema.Types.ObjectId,        // 1 product → many variants relationship.
        ref : "Product",
        required : true
    },
    format : { 
        type : String,         // "Paperback", "Hardcover", "eBook"
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
    }

},{timestamps : true}
)