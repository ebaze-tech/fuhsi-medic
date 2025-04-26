const Admin = require("../model/adminSchema.js")
const Form = require("../model/formSchema.js")
const mongoose = require("mongoose")
const { ObjectId } = mongoose.Types;

const viewForms = async (req, res) => {
    try {
        const admin = await Admin.findById(req.user.id).select('email');
        if (!admin) {
            return res.status(404).json({ message: "Invalid admin user" });
        }

        const forms = await Form.find()
        console.log("Form found:", forms);
        return res.status(200).json(forms);

    } catch (error) {
        console.error("Error:", error);
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

const viewSingleForm = async (req, res) => {
    try {
        const { formId } = req.params

        if (!ObjectId.isValid(formId)) {
            return res.status(400).json({
                message: 'Invalid form ID format'
            });
        }

        const form = await Form.findById(formId)
        if (!form) {
            console.log("Form not found")
            return res.status(404).json({ message: "Form not found" })
        }

        console.log("Form found:", form);
        return res.status(200).json(form);

    } catch (error) {
        console.error("Error retrieving form", error.message)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}

const editForm = async (req, res) => {
    const formData = req.body

    try {
        const admin = await Admin.findById(req.user.id).select('email')
        if (!admin) {
            return res.status(404).json({ message: "Invalid admin user" })
        }

        const { formId } = req.params
        const form = await Form.findById(formId)

        if (!form) {
            console.log("Form not found")
            return res.status(404).json({ message: "Form not found" })
        }

        Object.keys(formData).forEach(key => {
            form[key] = formData[key]
        })

        const updatedForm = await form.save()

        res.status(200).json({
            message: "Form updated successfully",
            updatedForm
        })
    } catch (error) {
        console.error("Error updating form:", error.message)
        return res.status(500).json({ message: "Internal Server Error", error: error.message })
    }
}
module.exports = { viewForms, viewSingleForm, editForm }