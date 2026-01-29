
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


 // filter ( Search works without category - Category is optional)

   let filterQuery = {
    isActive : true,
    $or :[
      {title : {$regex : search, $options :"i"}},
      {author : {$regex : search, $options : "i"}}
    ]
   }

   if(selectedCategory){
    filterQuery.category = selectedCategory   // add category only if selected
   }


 // fetch Products with pagination   
   
   const products = await Product.find(filterQuery)
   .sort(sortQuery)
   .skip(skip)
   .limit(limit)


   // pagination count

   const totalProducts = await Product.countDocuments(filterQuery) 

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



router.get("/product/:id", async (req, res) => {
  const productId = req.params.id;   // extract params id

  //  prevent crash if user provided invalid id's
  if (!mongoose.Types.ObjectId.isValid(productId)) {    // accept only validobjectId's by mongodb
    return res.redirect("/shop");
  }

  const product = await Product.findById(productId);   // fetch product from database

  if (!product) {
    return res.redirect("/shop");      // if no product - redirect to shop page -> prevents blank page or error
  }

  res.render("user/product_details", { product });
});







export default router;