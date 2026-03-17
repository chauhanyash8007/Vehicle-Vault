const router = require("express").Router()
const CategorysController = require("../controllers/CategorysController")
router.post("/category",CategorysController.createCategory)
router.get("/categories",CategorysController.getAllCategories)
module.exports = router