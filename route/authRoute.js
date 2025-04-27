const express = require("express")
const router = express.Router()

const { adminAuthController, userAuthController, adminRegisterController, userRegisterController } = require("../controller/authController")
const { isAdmin, authenticateUser } = require("../middleware/authMiddleware")

router.post("/admin/login", adminAuthController)
router.post("/admin/register", adminRegisterController)
router.post("/user/login", userAuthController)
router.post("/user/register", userRegisterController)

router.get("/verify/admin", isAdmin, (req, res) => {
    return res.status(200).json({ valid: true, adminId: req.admin.id })
})

router.get("/verify/user", authenticateUser, (req, res) => {
    return res.status(200).json({ valid: true, userId: req.user.id })
})
module.exports = router

