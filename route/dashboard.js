const express = require("express")
const router = express.Router()
const { viewForms, editForm, viewSingleForm } = require("../controller/adminDashboardController")
const { isAdmin, authenticateUser } = require("../middleware/authMiddleware")

router.get("/all-forms", isAdmin, viewForms)
router.get("/form/:formId", authenticateUser, isAdmin, viewSingleForm)
// router.get("/form/student/:formId",authenticateUser,viewSingleForm)
router.put("/edit-form", isAdmin, editForm)


module.exports = router