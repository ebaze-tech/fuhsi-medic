const express = require("express");
const router = express.Router();
const { getTotalForms } = require("../controller/formController");

router.get("/count", getTotalForms);

module.exports = router;
