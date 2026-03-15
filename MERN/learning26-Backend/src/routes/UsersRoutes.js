const router = require("express").Router()
const UsersController = require("../controllers/UsersController")

router.post("/register", UsersController.registerUser)

module.exports = router