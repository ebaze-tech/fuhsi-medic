const express = require("express")
const router = express.Router()
const { viewForms, editForm, viewSingleForm } = require("../controller/adminDashboardController")
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware")

router.get("/all-forms", authenticateUser, isAdmin, viewForms)
router.get("/form/:formId", authenticateUser, isAdmin, viewSingleForm)
router.put("/edit-form", authenticateUser, isAdmin, editForm)

module.exports = router