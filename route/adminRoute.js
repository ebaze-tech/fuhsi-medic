const express = require("express")
const router = express.Router()

const { adminAuthController } = require("../controller/authController")

router.post("/admin/login", adminAuthController)

module.exports = router