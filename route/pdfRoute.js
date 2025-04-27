const express = require("express")
const router = express.Router()

const { pdfController, pdfDownloadController, pdfUpdateController } = require("../controller/pdf")
const { authenticateUser, isAdmin } = require("../middleware/authMiddleware")

router.post('/generate', authenticateUser, pdfController)
router.get('/:formId/download', authenticateUser, pdfDownloadController)
router.put('/:formId/update', authenticateUser, isAdmin, pdfUpdateController)

module.exports = router