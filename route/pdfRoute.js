const express = require("express")
const router = express.Router()

const { pdfController } = require("../controller/pdf")

router.post('/generate', pdfController)

module.exports = router