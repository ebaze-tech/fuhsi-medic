const express = require("express");
const router = express.Router();
const {
  viewForms,
  editForm,
  viewSingleForm,
  userForm,
} = require("../controller/adminDashboardController");
const { isAdmin, authenticateUser } = require("../middleware/authMiddleware");

router.get("/all-forms", isAdmin, viewForms);
router.get("/form/student", authenticateUser, userForm);
router.get("/form/:formId", isAdmin, viewSingleForm);
router.get("/form/view/:formId", authenticateUser, viewSingleForm);
router.get("/form/student/:formId", authenticateUser, viewSingleForm);
router.put("/edit-form", isAdmin, editForm);

module.exports = router;
