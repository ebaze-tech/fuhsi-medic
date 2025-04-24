const MedicalForm = require("./model");
const generatePDF = require("./pdf-gen");

router.post("/medical-form", async (req, res) => {
  const {
    surname,
    otherNames,
    age,
    dob,
    sex,
    nationality,
    state,
    maritalStatus,
    faculty,
    matricNo,
    jambRegNo,
    department,
    telNo,
    religion,
    nextOfKinName,
    relationship,
    nextOfKinAddress,
    nextOfKinTel,
  } = req.body;
  try {
    const form = new MedicalForm({
      surname,
      otherNames,
      age,
      dob,
      sex,
      nationality,
      state,
      maritalStatus,
      faculty,
      matricNo,
      jambRegNo,
      department,
      telNo,
      religion,
      nextOfKinName,
      relationship,
      nextOfKinAddress,
      nextOfKinTel,
    });
    await form.save();

    // Generate PDF after saving
    const pdfPath = await generatePDF(form);

    res.status(201).json({ message: "Form saved and PDF generated", pdfPath });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error while saving form" });
  }
});

router.get('/medical-form/pdf/:filename', (req, res) => {
    const { filename } = req.params;
    const filePath = path.join(__dirname, '../pdfs', filename);
  
    res.download(filePath);
  });
  