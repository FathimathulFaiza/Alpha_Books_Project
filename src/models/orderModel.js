
import mongoose from "mongoose"

const orderSchema = new mongoose.Schema({
    user : {   // tells who placed the order 
        type : mongoose.Schema.Types.ObjectId,   // stores the users mongodb id
        ref : "User",    // onnects this order to "user" collection
        required : true
    },
    totalAmount : {
        type : Number,
        required : true
    },
    paymentMethode : {
        type : String,
        required : true
    },
    status : {
        type : String,
        default : "Placed"
    }

},{timestamps : true}
)


const Order = mongoose.model("Order",orderSchema)

export default Order