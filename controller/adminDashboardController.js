const Admin = require("../model/adminSchema.js");
const User = require("../model/userSchema.js");
const Form = require("../model/formSchema.js");
const mongoose = require("mongoose");
const { ObjectId } = mongoose.Types;

const viewForms = async (req, res) => {
  try {
    const forms = await Form.find().sort({ surname: 1, otherNames: 1 });
    console.log("Form found:", forms);
    return res.status(200).json(forms);
  } catch (error) {
    console.error("Error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const userForm = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("surname");
    console.log(user);
    if (!user) {
      return res.status(404).json({ message: "Invalid user" });
    }

    const forms = await Form.find({ surname: user.surname });

    console.log("Forms found:", forms);
    return res.status(200).json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const viewSingleForm = async (req, res) => {
  try {
    // if (!req.user || !req.user.id) {
    //   return res
    //     .status(401)
    //     .json({ message: "Unauthorized. User not authenticated." });
    // }

    const { formId } = req.params;
    console.log(formId);
    // const admin = await Admin.findById(req.user.id).select('email')
    // const user = await User.findById(req.user.id).select("utmeNo");

    // if (!user) {
    //   return res.status(404).json({ message: "Invalid user" });
    // }
    if (!ObjectId.isValid(formId)) {
      return res.status(400).json({
        message: "Invalid form ID format",
      });
    }

    const form = await Form.findById(formId);
    if (!form) {
      console.log("Form not found");
      return res.status(404).json({ message: "Form not found" });
    }

    console.log("Form found:", form);
    return res.status(200).json(form);
  } catch (error) {
    console.error("Error retrieving form", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

const editForm = async (req, res) => {
  const formData = req.body;

  try {
    const admin = await Admin.findById(req.user.id).select("email");
    if (!admin) {
      return res.status(404).json({ message: "Invalid admin user" });
    }

    const { formId } = req.params;
    const form = await Form.findById(formId);

    if (!form) {
      console.log("Form not found");
      return res.status(404).json({ message: "Form not found" });
    }

    Object.keys(formData).forEach((key) => {
      form[key] = formData[key];
    });

    const updatedForm = await form.save();

    res.status(200).json({
      message: "Form updated successfully",
      updatedForm,
    });
  } catch (error) {
    console.error("Error updating form:", error.message);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};
module.exports = { viewForms, viewSingleForm, editForm, userForm };
