const express = require("express")
const router = express.Router()

const { adminAuthController, userAuthController, adminRegisterController, userRegisterController } = require("../controller/authController")

router.post("/admin/login", adminAuthController)
router.post("/admin/register", adminRegisterController)
router.post("/user/login", userAuthController)
router.post("/user/register", userRegisterController)

module.exports = router

