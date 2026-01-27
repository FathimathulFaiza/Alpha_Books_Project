
import express from "express"
import Category from "../models/categoryModel.js"

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



export default router