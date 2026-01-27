
import express from "express"
import Category from "../models/categoryModel.js"
import Product from "../models/productModel.js"

const router = express.Router()


// routes

router.get("/login",(req,res)=>{
    res.render("admin/login")
})

router.post("/login",(req,res)=>{
    
    const {email,password} = req.body

    console.log("Admin Login Attempt")
    console.log("email : ",email)
    console.log("Password : ", password)

    if(email === "admin@gmail.com" && password === "admin123"){
        req.session.isAdmin = true
        return res.redirect("/admin/dashboard")
    }

    res.redirect("/admin/dashboard")
})

router.get("/dashboard",(req,res)=>{
    res.render("admin/dashboard")
})

router.get("/products",(req,res)=>{
    res.render("admin/products")
})

router.get("/orders",(req,res)=>{
    res.render("admin/orders")
})


router.get("/users",(req,res)=>{
    res.render("admin/users")
})

router.get("/categories", async(req,res)=>{

    const categories = await Category.find()

    res.render("admin/categories", {categories})
})

router.post("/categories", async(req,res)=>{

    const {name, description} = req.body

    const existingCategory = await Category.findOne({name})

    if(existingCategory){
        return res.redirect("/admin/categories")
    }

    await Category.create({
        name,
        description
    })
        res.redirect("/admin/categories")
})


router.post("/categories/toggle/:id",async(req,res)=>{
    const categoryId = req.params.id

    const category = await Category.findById(categoryId)

    category.isActive = !category.isActive

    await category.save()

        res.redirect("/admin/categories")
    
})

router.get("/test-product", async (req, res) => {
  await Product.create({
    title: "Atomic Habits",
    author: "James Clear",
    description: "A book about building good habits",
    price: 499,
    category: "6977a671b10307f65a463931", // book category ID
    stock: 10,
    images: ["test.jpg"]
  });

  res.send("Product created");
});


export default router