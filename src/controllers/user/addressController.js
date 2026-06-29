
import { 
    getUserById,
    removeAddress,
    addAddressToUser,
    updateAddress,
    setAddressAsDefault,
    clearDefaultAddresses,



 } from '../../services/addressService.js';



// function to load add address page
export const loadAddresses = async(req,res)=>{
        try{
            const userSession = req.user || req.session.user

            // check is the user is logged in redirect to login
            if(!userSession){
                return res.redirect('/login')
            }

            // take the id of the logged in user
            const userId = userSession._id

            const user = await getUserById(userId)  // fetch the full details of the user from db using userId

            res.render('user/addresses',{
                title : "Alpha Books - Address Book",
                user : user,
                error : req.query.error || null,
                message : req.query.message || null
            })

        }
        catch(error){
            console.log("error in loadAdresses controller", error.message)
            res.status(500).send("Internal Server Error")
        }
    }

    // add addresses by the user in the db

    export const postAddAddresses = async(req,res)=>{
        try{
            const userSession = req.user || req.session.user

            if(!userSession){       // check if the user is logged in - user is in the session

                return res.redirect('/login')  // else redirect to login page
            }

            const userId = userSession._id      // saving the userId from the session

            const {            // destructure the data filled by the user when add the address
                firstName,
                lastName,
                email,
                mobile,
                addressLine,
                cityOrDistrict,
                state,
                pincode,
                landmark,
                addressType,
                isDefault
            } = req.body

            // validation
            if(!firstName || !lastName || !email || !mobile || !addressLine || !cityOrDistrict || !state || !landmark || !pincode || !addressType){

                const user = await getUserById(userId)      // find the user 

                return res.render('user/addresses', {           // render the same page
                    title : "Alpha Books - Address Book",
                    user : user,
                    error : "All required fields are mandatory..!",
                    message : null
                })
            }

            // regex validation for mobile and picode
            const mobilePattern = /^[0-9]{10}$/;     // 10 numbers
            const pincodePattern = /^[0-9]{6}$/      // 6 numbers

            if(!mobilePattern.test(mobile) || !pincodePattern.test(pincode)){     // if mobile and pincode are wrong
                const user = await getUserById(userId);
            
            return res.render('user/addresses', {
                title: "Alpha Books - Address Book",
                user: user,
                error: "Invalid mobile number or pincode format!",
                message: null
            });
        }


                        // default address
            if(isDefault ==='on'){
                await clearDefaultAddresses(userId)
            }
        
        

            // creating new address with the given information
            const newAddress = {
                firstName,
                lastName,
                email,
                mobile,
                addressLine,
                cityOrDistrict,
                state,
                landmark,
                pincode,
                addressType,
                isDefault : isDefault === 'on'
            }

            // find the user from the db and add (push) the new address to the address array

            await addAddressToUser(userId, newAddress)
            

            console.log("New Address is added for the user successfully ", userId)

            // after saving the address redirect to the address page with success msg

            return res.redirect('/addresses?message=Address added successfully..')


        }
        catch(error){
            console.log("Error in postAddAddresses controller", error.message)
            res.status(500).send("Internal Server Error")
        }
    }




    // delete address from the array 
    export const deleteAddress = async (req,res)=>{
        try{
            const userSession = req.user || req.session.user

            if(!userSession){
                return res.redirect('/login')
            }


            const userId = userSession._id    // id of the logged in user

            const addressId = req.params.id   // id of the address getting from the url to delete


            await removeAddress(userId, addressId)

            console.log("Address deleted Successfully")

            return res.redirect('/addresses?message=Address deleted successfully..')

        }
        catch(error){
            console.log("Error in deleteAddress controller", error.message)
            res.status(500).send("Internal Server Error")
        }
    }


    // edit address

    export const loadEditAddress = async(req,res)=>{
        try{
            const userSession = req.user || req.session.user

            if(!userSession){
                return res.redirect('/login')    // check user is logged in
            }

            const userId = userSession._id     // id of the logged in user

            const addressId = req.params.id     // address id comes through url to delete

            const user = await getUserById(userId)    // fetch details of the user from db using userId

            if(!user){
                return res.redirect('/login')     // if not user in db 
            }
 
            const address = user.addresses.id(addressId)    // find the id of the address to delete

            res.render('user/edit-address', {
                user,
                address,
                message : req.query.message || null,
                error : req.query.error || null
            })

        }
        catch(error){
            console.log("Error in loadEditAddress controller", error.message)
            res.status(500).send("Internal Server Error")
        }
    }



    // update the new address in the db

    export const postEditAddress = async(req,res)=>{
        try{
            const userSession = req.user || req.session.user

            if(!userSession){
                return res.redirect('/login')     // check if user is logged in
            }

            const userId = userSession._id  // id of the logged in user

            const addressId = req.params.id   // id of the address comes through url

            const user = await getUserById(userId)   // find the user from db

            const {
                firstName,
                lastName,
                email,
                mobile,
                addressLine,
                cityOrDistrict,
                state,
                pincode,
                landmark,
                addressType,
                isDefault

            } = req.body        // extract the user given details from req.body


        // if there is any error in form - pass the user this data 
            const currentAddress = {
            _id: addressId,
            firstName, lastName, email, mobile, addressLine, cityOrDistrict, state, landmark, pincode, addressType,
            isDefault: isDefault === 'on'
        }

            // validation
            if(!firstName || !lastName || !mobile || !addressLine || !cityOrDistrict || !state || !pincode ||!addressType){
                return res.render('user/edit-address', {
                    user,
                    address : currentAddress,
                error : "All fields are mandatory..!"
                
      
            })
        }

               // validation for mobile and pincode
            const mobilePattern = /^[0-9]{10}$/
            const pincodePattern = /^[0-9]{6}$/

            if(!mobilePattern.test(mobile) || !pincodePattern.test(pincode)){
            
                return res.render('user/edit-address', {
                    user : user,
                    address : currentAddress,
                    error : "Invalid Mobile or Pincode Format..!",
                    message : null
                })
            }

            // default address
            if(isDefault === 'on'){
                await clearDefaultAddresses(userId)
            }

    

            // update the changes in the db
          await updateAddress(userId, addressId, currentAddress)
       
                return res.redirect('/addresses?message=Address updated successfully')

        }
        catch(error){
            console.log("Error in postEditAddress controller", error.message)
            res.status(500).send("Internal Server Error")
        }
    }


    export const setDefaultAddress = async (req,res)=>{
        try{
            const userSession = req.user || req.session.user

            if(!userSession){
                return res.redirect('/login')
            }

            const userId = userSession?._id

            const addressId = req.params.id

            // make all the addresses 'false' first
            await setAddressAsDefault(userId, addressId)

            res.redirect('/addresses?message=Default address updated successfully')

        }
        catch(error){
            console.log("Error in setDefaultaddress controller ", error)
            res.status(500).send("Internal Server Error")
        }
    }


    
