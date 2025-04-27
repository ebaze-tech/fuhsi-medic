const express = require("express")
const router = express.Router()
const { viewForms, editForm, viewSingleForm } = require("../controller/adminDashboardController")
const { isAdmin } = require("../middleware/authMiddleware")

router.get("/all-forms", isAdmin, viewForms)
router.get("/form/:formId", isAdmin, viewSingleForm)
router.put("/edit-form", isAdmin, editForm)

module.exports = router