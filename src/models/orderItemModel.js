
import mongoose from "mongoose"

const orderItemSchema = new mongoose.Schema ({

    order : {      // tells which order this item belongs to
        type : mongoose.Schema.Types.ObjectId,  
        ref : "Order",    // Which products belong to which order
        required : true
    },

    productVariant : {
        type : mongoose.Schema.Types.ObjectId,
        ref : "ProductVariant",
        required : true

    },
    quantity :{
        type : Number,
        required : true,
        min : 1    // prevents invalid orders (0 or negative)

    },
    price : {          // price at the time of order
        type : Number,
        required : true

    }


},{timestamps : true}
)

const OrderItem = mongoose.model("OrderItem",orderItemSchema)

export default OrderItem

