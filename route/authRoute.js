const express = require("express")
const router = express.Router()

const { adminAuthController, userAuthController } = require("../controller/authController")

router.post("/admin/login", adminAuthController)
router.post("/user/login", userAuthController)

module.exports = router