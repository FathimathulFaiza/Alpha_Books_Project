
import express from "express"
import Category from "../models/categoryModel.js";

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

// Shop
router.get("/shop", async (req, res) => {
  const categories = await Category.find({isActive : true})

  res.render("user/shop",{categories});
});

router.get("/product/:id", (req, res) => {
  res.render("user/product_detail");
});

export default router;