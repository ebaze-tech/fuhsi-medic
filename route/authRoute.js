const express = require("express")
const router = express.Router()

const { adminAuthController, userAuthController, adminRegisterController } = require("../controller/authController")

router.post("/admin/login", adminAuthController)
router.post("/admin/register", adminRegisterController)
router.post("/user/login", userAuthController)

module.exports = router

