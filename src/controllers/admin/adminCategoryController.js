
import Category from '../../models/categoryModel.js';
import slugify from 'slugify';




// function to show the category page

    const getCategoryPage = async (req,res)=>{

        try{
            const categories = await Category.find().sort({createdAt : -1})  // take all the categories list from db in descending order-> latest first

            res.render('admin/categories',{  // rendering the categories
                categories : categories,
                title : "Category",
                error : null
            })
        }
        catch(error){
            console.log("Error in category Page..",error)
            res.status(500).send("Internal Server Error")
        }
    }



    // function to add a new category

    const addCategory = async(req,res)=>{
        try{
            const {name, description} = req.body


            // check if category is already exists
            const existingCategory = await Category.findOne({
                name :{$regex: new RegExp("^" + name + "$" , "i")}   // search the exact name , same name starts with and w=ends with ,no matter case sensitive
            })


            // if the category already exists
            if(existingCategory){
                console.log("Category already Exists..!")

                const categories = await Category.find().sort({createdAt:-1})

                return res.render('admin/categories',{
                    categories : categories,
                    title : "Category",
                    error : "Category already exists..!!"
                })
            }

            // generate 'Slug'

            const slug = slugify(name, {lower : true, strict : true})  // to make the 'slug' -> name of the category,make lowerCase, remove other symbols
            

          // creating new category and save to db
            const newCategory = new Category({
                name ,
                slug ,
                description,
                isListed : true
            })

            await newCategory.save()

            res.redirect('/admin/category')
        }
        catch(error){
            console.log("Error in addCategory!",error.message)
            const categories = await Category.find({}).sort({createdAt:-1})
            res.render('admin/categories', {categories, 
                title : "Category",
                error : "Problem in adding category.!!"})

        }
    }



    // function for toggle button incategoreies list/unList

    const toggleCategoryList = async (req,res)=>{

        try{
            const categoryId = req.params.id
            
            // find the category using id
            const category = await Category.findById(categoryId)

            if(!category){

                console.log("Category ot found.!!")
                return res.redirect('/admin/category')
            }

            // to make the toggle list or unList 
            category.isListed = !category.isListed

            await category.save() // save the changes in db

            res.redirect('/admin/category')
        }
        catch(error){
            console.log("Error in toggleCategoryList",error.message)
            res.redirect('/admin/category')

        }
    }

   // function to load the edit category page

   const loadEditCategory = async(req,res)=>{
    try{
        const id = req.params.id

        const category = await Category.findById(id)

        if(!category){
            return res.redirect('/admin/category')
        }

        res.render('admin/editCategory',{
            category : category,
            title : "Category",
            error : null
        })
    }
    catch(error){
        console.log("Error in loadEditCategory",error.message)
        res.status(500).send("Internal Server Error")

    }
   }


   // function to update in the db of edited category

   const  editCategory = async (req,res)=>{
    try{
        const id = req.params.id

        const {name, description} = req.body
        
        //checking the duplicate
        const existingCategory = await Category.findOne({

            name : {$regex : new RegExp("^" + name + "$" , "i")},
            _id :{$ne: id}    // id should not be same
        })

        // if category exists

        if(existingCategory){

            const category = await Category.findById(id)

            return res.render('admin/category',{
                category : category,
                title : "Category",
                error : "Category name already exists..!"

            })
        }

        // generate slug for the new category

        const slug = slugify(name, {lower : true, strict : true})


        //update db
        await Category.findByIdAndUpdate(id, {
            $set :{
                name : name,
                slug : slug,
                description : description
            }
        })
        res.redirect('/admin/category')
    }
    catch(error){
        console.log("Error in edit category..!",error.message)

        res.status(500).send("Internal Server Error")
    }
   }


export default {
    getCategoryPage,
    addCategory,
    toggleCategoryList,
    loadEditCategory,
    editCategory
}













