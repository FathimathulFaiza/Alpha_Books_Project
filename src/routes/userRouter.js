
import express from "express"
import Category from "../models/categoryModel.js";
import Product from "../models/productModel.js"

const router = express.Router()


// Home
router.get("/", (req, res) => {
  res.render("user/home");
});

// Auth
router.get("/login", (req, res) => {
  res.render("user/login");
});

router.get("/signup", (req, res) => {
  res.render("user/signup");
});

router.get("/otp", (req, res) => {
  res.render("user/otp");
});

router.get("/forgot-password", (req, res) => {
  res.render("user/forgot_password");
});

router.get("/change-password", (req, res) => {
  res.render("user/change_password");
});



// Shop page

router.get("/shop", async (req, res) => {

  // Query params
  const selectedCategory = req.query.category

  const search = req.query.search || ""       // search query

  const sort = req.query.sort || ""

  console.log("ID of the selected category is : ", selectedCategory)
   console.log("Search:", search);

// pagination  -> Pagination must work with category + search + sort together

   const page = parseInt(req.query.page) || 1

   const limit = 4

   const skip = (page - 1) * limit 



// categories
   const categories = await Category.find({isActive : true})     // show only the category which is active - true


  // sorting 
  let sortQuery = {}

  if(sort === "price_asc"){    // ascending price  (low → high) - price
    sortQuery.price = 1
  }

  else if(sort === "price_desc"){   
    sortQuery.price = -1

  }
  else if(sort === "name_asc"){   // string sort alphabetically ->  A → Z  - title
    sortQuery.title = 1
  }
  else if(sort === "name_desc"){
    sortQuery.title = -1
  }


 // filter

   let filterQuery = {}
   let products = []
   let totalProducts = 0

  if(selectedCategory){               // Shows products only from selected category

  filterQuery = {
      category : selectedCategory,
      isActive : true,    // hides the blocked,unlisted, soft deleted products - shows only active products
      $or:[
        {title : {$regex : search, $options : "i"}},    // filter search by title and author   -> "i" = case-insensitive
        {author : {$regex : search, $options : "i"}}
      ]
    }
    }


 // Products with pagination   
   
    if(selectedCategory){
      products = await Product.find(filterQuery) 
      .sort(sortQuery)    //  applies whichever sorting user selected
      .skip(skip)
      .limit(limit)
    

  // count totalProducts 

    totalProducts = await Product.countDocuments(filterQuery)

    
  }

   const totalPages = Math.ceil(totalProducts/limit)   // count total products


  res.render("user/shop",{       // rendering all these
    categories,
    selectedCategory,
    products,
    search,
    currentPage : page,
    totalPages
  });
});



router.get("/product/:id", async(req, res) => {
  const productId = req.params.id

  const product = await Product.findById(productId)

  if(!product){
    return res.redirect("/shop")
  }
  res.render("user/product_details", {product});
});







export default router;