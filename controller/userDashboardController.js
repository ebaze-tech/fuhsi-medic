const User = require("../model/userSchema.js")
const Form = require("../model/formSchema.js")

const viewSingleForm = async (req, res) => {
    try {
        const { formId } = req.params
        const form = await Form.findById(formId)

        if (!form) {
            console.log("Form not found")
            return res.status(404).json({ message: "Form not found" })
        }

        console.log("Form found:", form)
        return res.status(200).json(form)
    } catch (error) {
        console.error("Error retrieving form", error.message)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

module.exports = { viewSingleForm }