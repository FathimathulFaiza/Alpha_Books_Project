
import User from '../../models/userModel.js';

// function to show the users list (loadUsers) -> (search ,pagination, descending order and sorting)

    const loadUsers = async(req,res)=>{

        try{

            const searchQuery = req.query.search || ""      // get the value coming from the search bar through URL

          

            const page = parseInt(req.query.page)|| 1  // pagination , default page 1 -> to get the current page from url (?page=2) -> convert the string to number from url

            const limit = 10    // number of users display per page (set the limit) -> (1−1)×10=0.

            const skip = (page - 1) * limit

            const searchCriteria = {  // search in the db

                $or :[
                    {firstName: {$regex : searchQuery, $options : "i"}},
                    {lastName : {$regex : searchQuery, $options : "i"}},
                    {email : {$regex : searchQuery, $options : "i"}}
                ]
            }


            const users = await User.find(searchCriteria)   // fetch the users with matching criteria
            .sort({createdAt : -1})    // descending order -> latest first
            .skip(skip)     // pagination
            .limit(limit)   // limit of showing users


            const totalUsers = await User.countDocuments(searchCriteria)  // total count of users fetch from db according to the criteria
            
            const totalPages = Math.ceil(totalUsers / limit)  // total number of pages 

        
 
            res.render("admin/users",{    // render the page and pass the  user along with search query -> pass all the necessary variables along with

                users : users,
                searchQuery : searchQuery,
                currentPage : page,
                totalPages : totalPages,
                title : "Users"

            });
        }
        catch(error){
            console.log("Error in loadUsers",error.message);
            res.status(500).send("Server Error")

        }
    }




        // function to block or unblock user

    const toggleBlockUser = async (req,res)=>{

        try{
   
    const userId = req.params.id

    // find the user by id
    const user = await User.findById(userId)


    if(!user){

        return res.status(404).send("User not found..!!")
    }

    // toggle the 'isBlocked' status -> true become false, false become true

    user.isBlocked = !user.isBlocked

  await user.save()


    // redirect back to the users list page 
    res.redirect('/admin/users')

    }
    catch(error){
        console.log("Error in toggleBlockUser : ",error.message)

        res.status(500).send("Server Error...!")
   }

    }





    export default {
         loadUsers,
         toggleBlockUser,
         
        };