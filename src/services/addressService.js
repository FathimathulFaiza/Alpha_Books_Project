
import User from '../models/userModel.js'

 
export const getUserById = async(userId) =>{        // loadAddresses
    return await User.findById(userId)

}



export const removeAddress = async(userId, addressId) => {    // deleteAddress
    return await User.findByIdAndUpdate(userId, {
        $pull : {addresses : {_id : addressId}}
    })


}

 
export const addAddressToUser = async(userId, newAddress) =>{   // postAddAddress
    return await User.findByIdAndUpdate(userId,
        {$pull :{addresses : newAddress}},
        {new : true}
    )

}


export const updateAddress = async(userId, addressId, currentAddress) =>{     // postEditAddress
    return await User.updateOne(
       { _id : userId, "addresses._id" : addressId},
       {$set : {"addresses.$" :currentAddress }}
)
}


export const clearDefaultAddresses = async (userId)=> {       // postEditAddress
    return await User.updateOne(
        {_id : userId},
        {$set : {"addresses.$[].isDefault" : false}}
    )

}



export const setAddressAsDefault = async(userId, addressId) =>{
    await User.updateOne(
        {_id : userId},
        {$set : {"addresses.$[].isDefault" : false}}     // reset all addresses
    )

    return await User.updateOne(
        {_id : userId, "addresses._id" : addressId},
        {$set : {"addresses.$.isDefault" : true}}

    )
}