const mongoose = require("mongoose");
const Form = require("./model/formSchema");
require("dotenv").config();

mongoose
  .connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

async function cleanDB() {
  try {
    const forms = await Form.find();
    for (const form of forms) {
      form.surname.trim().replace(/\s+/g, " ");
      form.otherNames.trim().replace(/\s+/g, " ");
      // form.utmeNo = form.utmeNo.trim().replace(/\s+/g, " ");
      form.age.trim().replace(/\s+/g, " ");
      form.sex.trim().replace(/\s+/g, " ");
      form.nationality.trim().replace(/\s+/g, " ");
      form.state.trim().replace(/\s+/g, " ");
      form.jambRegNo.trim().replace(/\s+/g, " ");
      form.department.trim().replace(/\s+/g, " ");
      form.faculty.trim().replace(/\s+/g, " ");
      form.religion.trim().replace(/\s+/g, " ");
      form.dob.trim().replace(/\s+/g, " ");
      form.maritalStatus.trim().replace(/\s+/g, " ");
      form.matricNo.trim().replace(/\s+/g, " ");
      form.telNo.trim().replace(/\s+/g, " ");
      form.nextOfKinName.trim().replace(/\s+/g, " ");
      form.relationship.trim().replace(/\s+/g, " ");
      form.nextOfKinAddress.trim().replace(/\s+/g, " ");
      form.nextOfKinTel.trim().replace(/\s+/g, " ");
      await form.save();
      console.log("Form cleaned successfully!");
      process.exit(1);
    }
  } catch (error) {
    console.error("Error cleaning DB: ", error);
    process.exit(1);
  }
}

cleanDB();
