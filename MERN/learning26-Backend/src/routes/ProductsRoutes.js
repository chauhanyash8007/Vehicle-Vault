const router = require("express").Router()
const ProductsController = require("../controllers/ProductsController")
router.get("/products",ProductsController.getAllProducts)
router.post("/product",ProductsController.createProduct)
module.exports = router