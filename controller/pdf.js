const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { renderTableWithBorders } = require("../utils/utils");
const Form = require("../model/formSchema");
const Admin = require("../model/adminSchema.js");

const pdfController = async (req, res) => {
  let filePath;
  try {
    const formData = req.body;

    const existingForm = await Form.findOne({
      $or: [{ matricNo: formData.matricNo }, { jambRegNo: formData.jambRegNo }],
    });

    if (existingForm) {
      return res.status(400).json({
        message:
          "Form already submitted. Duplicate submissions are not allowed.",
      });
    }

    const newForm = new Form(formData);
    await newForm.save();
    console.log("Form saved");

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `${formData.surname}-${formData.otherNames}-new-questionnaire-response.pdf`;
    const filePath = path.join(
      __dirname,
      "..",
      "admin_questionnaire_files",
      fileName
    );

    // if (!fs.existsSync(path.dirname(filePath))) {
    //   fs.mkdirSync(path.dirname(filePath), { recursive: true });
    // }

    // const stream = fs.createWriteStream(filePath);

    // res.setHeader("Content-Type", "application/pdf");
    // res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    // doc.pipe(stream);
    // doc.pipe(res);

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.pipe(res);

    // Page 1: Header, Student Details, and Table A
    doc
      .fontSize(14)
      .text("FEDERAL UNIVERSITY OF HEALTH SCIENCES, ILA ORANGUN", {
        align: "center",
      });
    doc.moveDown(1);
    doc
      .fontSize(12)
      .text("MEDICAL ENTRANCE SCREENING EXAMINATION FORM FOR STUDENTS", {
        align: "center",
      });
    doc.moveDown(1);
    doc
      .fontSize(10)
      .text(
        "Student is requested to complete part I of this form, parts II & III will be completed by the designated officers at the University health center. The completed form should be forwarded to the Medical Director, University Health Services and archived in the students clinical folder.",
        {
          align: "justify",
        }
      );
    doc.moveDown(1);

    doc
      .fontSize(12)
      .text("PART I", { underline: true, align: "left" })
      .moveDown();
    doc.fontSize(10);
    doc.text(`Surname: ${formData.surname}`, { align: "left" }).moveDown(0.5);
    doc
      .text(`Other Names: ${formData.otherNames}`, { align: "left" })
      .moveDown(0.5);
    doc
      .text(
        `Age: ${formData.age}  |  Date of Birth: ${formData.dob}  |  Sex: ${formData.sex}`,
        { align: "left" }
      )
      .moveDown(0.5);
    doc
      .text(`Nationality: ${formData.nationality} | State: ${formData.state}`, {
        align: "left",
      })
      .moveDown(0.5);
    doc
      .text(
        `Marital Status: ${formData.maritalStatus} | Faculty: ${formData.faculty}`,
        { align: "left" }
      )
      .moveDown(0.5);
    doc
      .text(
        `Matric No: ${formData.matricNo} | Jamb Reg No: ${formData.jambRegNo}`,
        { align: "left" }
      )
      .moveDown(0.5);
    doc
      .text(`Department: ${formData.department} | Tel No: ${formData.telNo}`, {
        align: "left",
      })
      .moveDown(0.5);
    doc.text(`Religion: ${formData.religion}`, { align: "left" }).moveDown(0.5);
    doc.text(`For Emergencies:`, { align: "left" }).moveDown(0.5);
    doc
      .text(
        `Next of Kin: ${formData.nextOfKinName} (${formData.relationship})`,
        {
          align: "left",
        }
      )
      .moveDown(0.5);
    doc
      .text(`Address: ${formData.nextOfKinAddress}`, { align: "left" })
      .moveDown(0.5);
    doc.text(`Tel: ${formData.nextOfKinTel}`, { align: "left" }).moveDown(1);

    // Tables
    const colWidths = [350, 50, 50];
    // const "Checked" = "\u2714"; // Bold "Checked" (✔)

    // Section A (Table A)
    const sectionARows = [
      [
        "a. Tuberculosis",
        formData.tuberculosisYes ? "Checked" : "",
        formData.tuberculosisNo ? "Checked" : "",
      ],
      [
        "b. Asthma",
        formData.asthmaYes ? "Checked" : "",
        formData.asthmaNo ? "Checked" : "",
      ],
      [
        "c. Peptic Ulcer Disease",
        formData.pepticUlcerYes ? "Checked" : "",
        formData.pepticUlcerNo ? "Checked" : "",
      ],
      [
        "d. Sickle cell disease",
        formData.sickleCellYes ? "Checked" : "",
        formData.sickleCellNo ? "Checked" : "",
      ],
      [
        "e. Allergies",
        formData.allergiesYes ? "Checked" : "",
        formData.allergiesNo ? "Checked" : "",
      ],
      [
        "f. Diabetes",
        formData.diabetesYes ? "Checked" : "",
        formData.diabetesNo ? "Checked" : "",
      ],
      [
        "g. Hypertension",
        formData.hypertensionYes ? "Checked" : "",
        formData.hypertensionNo ? "Checked" : "",
      ],
      [
        "h. Seizures/Convulsions",
        formData.seizuresYes ? "Checked" : "",
        formData.seizuresNo ? "Checked" : "",
      ],
      [
        "i. Mental illness",
        formData.mentalIllnessYes ? "Checked" : "",
        formData.mentalIllnessNo ? "Checked" : "",
      ],
    ];
    let y = renderTableWithBorders(
      doc,
      doc.y + 10,
      sectionARows,
      [
        "A) Do you suffer from or have you suffered from any of the following?",
        "Yes",
        "No",
      ],
      colWidths
    );
    doc.x = 50;
    doc.moveDown(2);

    // Page 2: Table B and Table C
    doc.addPage();
    doc.y = 50; // Reset y position for the new page

    // Section B (Table B)
    const sectionBRows = [
      [
        "1. Tuberculosis",
        formData.familyTuberculosisYes ? "Checked" : "",
        formData.familyTuberculosisNo ? "Checked" : "",
      ],
      [
        "2. Mental illness or insanity",
        formData.familyMentalIllnessYes ? "Checked" : "",
        formData.familyMentalIllnessNo ? "Checked" : "",
      ],
      [
        "3. Diabetes Mellitus",
        formData.familyDiabetesYes ? "Checked" : "",
        formData.familyDiabetesNo ? "Checked" : "",
      ],
      [
        "4. Heart Disease",
        formData.familyHeartDiseaseYes ? "Checked" : "",
        formData.familyHeartDiseaseNo ? "Checked" : "",
      ],
    ];
    y = renderTableWithBorders(
      doc,
      doc.y + 10,
      sectionBRows,
      ["B) Has any member of your family suffered from:", "Yes", "No"],
      colWidths
    );
    doc.x = 50;
    doc.moveDown(2);

    // Section C (Table C)
    const sectionCRows = [
      [
        "1. Small pox",
        formData.smallpoxYes ? "Checked" : "",
        formData.smallpoxNo ? "Checked" : "",
      ],
      [
        "2. Poliomyelitis",
        formData.poliomyelitisYes ? "Checked" : "",
        formData.poliomyelitisNo ? "Checked" : "",
      ],
      [
        "3. Tuberculosis",
        formData.immunizationTuberculosisYes ? "Checked" : "",
        formData.immunizationTuberculosisNo ? "Checked" : "",
      ],
      [
        "4. Meningitis",
        formData.meningitisYes ? "Checked" : "",
        formData.meningitisNo ? "Checked" : "",
      ],
      [
        "5. Human Papilloma Virus (for females only)",
        formData.hpvYes ? "Checked" : "",
        formData.hpvNo ? "Checked" : "",
      ],
      [
        "6. Hepatitis B",
        formData.hepatitisBYes ? "Checked" : "",
        formData.hepatitisBNo ? "Checked" : "",
      ],
    ];

    /* if (formData.sex === "Female") {
      sectionCRows.push([
        "5. Human Papilloma Virus (for females only)",
        formData.hpvYes ? "Checked" : "",
        formData.hpvNo ? "Checked" : "",
      ]),
        sectionCRows.push([
          "6. Hepatitis B",
          formData.hepatitisBYes ? "Checked" : "",
          formData.hepatitisBNo ? "Checked" : "",
        ]);
    } else {
      sectionCRows.push([
        "5. Hepatitis B",
        formData.hepatitisBYes ? "Checked" : "",
        formData.hepatitisBNo ? "Checked" : "",
      ]);
    }*/

    // Add Additional Questions to Section C table
    sectionCRows.push([
      "Do you currently use tobacco products such as cigarettes, snuff etc?",
      formData.tobaccoUseYes ? "Checked" : "",
      formData.tobaccoUseNo ? "Checked" : "",
    ]);
    sectionCRows.push([
      "Do you have someone at home/school/hostel who smokes when you are present?",
      formData.secondhandSmokeYes ? "Checked" : "",
      formData.secondhandSmokeNo ? "Checked" : "",
    ]);
    sectionCRows.push([
      "Do you currently consume alcohol?",
      formData.alcoholConsumptionYes ? "Checked" : "",
      formData.alcoholConsumptionNo ? "Checked" : "",
    ]);

    // Add the details rows to Section C table
    if (
      formData.tobaccoUseYes ||
      formData.secondhandSmokeYes ||
      formData.alcoholConsumptionYes
    ) {
      sectionCRows.push([
        `If the answer to any of the above is Yes, provide details: ${formData.tobaccoAlcoholDetails}`,
        "",
        "",
      ]);
    }
    sectionCRows.push([
      `If there is any other relevant medical information not stated above, please provide details: ${formData.otherMedicalInfo}`,
      "",
      "",
    ]);
    y = renderTableWithBorders(
      doc,
      doc.y + 10,
      sectionCRows,
      [
        "C) Have you been immunized against any of the following diseases:",
        "Yes",
        "No",
      ],
      colWidths
    );
    doc.x = 50;
    doc.moveDown(2);

    // Page 3: Part II and Part III
    doc.addPage();
    doc.y = 50; // Reset y position for the new page

    // Part II and Part III (Placeholders)
    doc
      .fontSize(12)
      .text("Part II Clinical Examination: (To be completed by clinic staff)", {
        underline: true,
        align: "left",
      })
      .moveDown();
    doc.fontSize(10);
    doc.text(
      `(a) Height:  __________________ (b) Weight:   __________________ (c) BMI:   __________________`,
      {
        align: "left",
      }
    );
    doc.text(
      `(d) Visual Acuity (R)  __________________ (L)   __________________`,
      { align: "left" }
    );
    doc
      .text(
        `(e) Blood Pressure (BP):   __________________ (f) Pulse rate (PR):   __________________`,
        {
          align: "left",
        }
      )
      .moveDown();

    doc
      .fontSize(12)
      .text(
        "Part III Laboratory Investigations: (To be completed by clinic staff)",
        { underline: true, align: "left" }
      )
      .moveDown();
    doc.fontSize(10);
    doc.text(`Urine __________________`, { align: "left" });
    doc.text(`Albumin   __________________`, { align: "left" });
    doc.text(`Sugar   __________________`, { align: "left" });
    doc.text(`Genotype  __________________`, { align: "left" });
    doc.text(`Blood Group  __________________`, { align: "left" });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        if (!res.headersSent) {
          res.status(500).send("Error sending file");
        }
      }
    });
  } catch (err) {
    console.error("Error saving form:", err);
    if (!res.headersSent) {
      res.status(500).json({ message: "Error generating PDF" });
    }
  }
};

const pdfDownloadController = async (req, res) => {
  let filePath;
  try {
    const { formId } = req.params;
    if (!formId) {
      console.log("Cannot locate form");
      return res.status(404).json({ message: "Cannot locate form" });
    }

    const form = await Form.findById(formId);
    if (!form) {
      console.log("Form not found");
      return res.status(404).json({ message: "Form not found" });
    }

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `${form.surname}-${form.otherNames}-questionnaire-response-${formId}.pdf`;
    const filePath = path.join(
      __dirname,
      "..",
      "users'_downloaded_files",
      fileName
    );

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);

    doc.pipe(stream);
    doc.pipe(res);

    // Page 1: Header, Student Details, and Table A
    doc
      .fontSize(14)
      .text("FEDERAL UNIVERSITY OF HEALTH SCIENCES, ILA ORANGUN", {
        align: "center",
      });
    doc.moveDown(1);
    doc
      .fontSize(12)
      .text("MEDICAL ENTRANCE SCREENING EXAMINATION FORM FOR STUDENTS", {
        align: "center",
      });
    doc.moveDown(1);
    doc
      .fontSize(10)
      .text(
        "Student is requested to complete part I of this form, parts II & III will be completed by the designated officers at the University health center. The completed form should be forwarded to the Medical Director, University Health Services and archived in the students clinical folder.",
        {
          align: "justify",
        }
      );
    doc.moveDown(1);

    doc
      .fontSize(12)
      .text("PART I", { underline: true, align: "left" })
      .moveDown();
    doc.fontSize(10);
    doc.text(`Surname: ${form.surname}`, { align: "left" }).moveDown(0.5);
    doc
      .text(`Other Names: ${form.otherNames}`, { align: "left" })
      .moveDown(0.5);
    doc
      .text(
        `Age: ${form.age}  |  Date of Birth: ${form.dob}  |  Sex: ${form.sex}`,
        { align: "left" }
      )
      .moveDown(0.5);
    doc
      .text(`Nationality: ${form.nationality} | State: ${form.state}`, {
        align: "left",
      })
      .moveDown(0.5);
    doc
      .text(
        `Marital Status: ${form.maritalStatus} | Faculty: ${form.faculty}`,
        { align: "left" }
      )
      .moveDown(0.5);
    doc
      .text(`Matric No: ${form.matricNo} | Jamb Reg No: ${form.jambRegNo}`, {
        align: "left",
      })
      .moveDown(0.5);
    doc
      .text(`Department: ${form.department} | Tel No: ${form.telNo}`, {
        align: "left",
      })
      .moveDown(0.5);
    doc.text(`Religion: ${form.religion}`, { align: "left" }).moveDown(0.5);
    doc.text(`For Emergencies:`, { align: "left" }).moveDown(0.5);
    doc
      .text(`Next of Kin: ${form.nextOfKinName} (${form.relationship})`, {
        align: "left",
      })
      .moveDown(0.5);
    doc
      .text(`Address: ${form.nextOfKinAddress}`, { align: "left" })
      .moveDown(0.5);
    doc.text(`Tel: ${form.nextOfKinTel}`, { align: "left" }).moveDown(1);

    // Tables
    const colWidths = [350, 50, 50];
    // const "Checked" = "\u2714"; // Bold "Checked" (✔)

    // Section A (Table A)
    const sectionARows = [
      [
        "a. Tuberculosis",
        form.tuberculosisYes ? "Checked" : "",
        form.tuberculosisNo ? "Checked" : "",
      ],
      [
        "b. Asthma",
        form.asthmaYes ? "Checked" : "",
        form.asthmaNo ? "Checked" : "",
      ],
      [
        "c. Peptic Ulcer Disease",
        form.pepticUlcerYes ? "Checked" : "",
        form.pepticUlcerNo ? "Checked" : "",
      ],
      [
        "d. Sickle cell disease",
        form.sickleCellYes ? "Checked" : "",
        form.sickleCellNo ? "Checked" : "",
      ],
      [
        "e. Allergies",
        form.allergiesYes ? "Checked" : "",
        form.allergiesNo ? "Checked" : "",
      ],
      [
        "f. Diabetes",
        form.diabetesYes ? "Checked" : "",
        form.diabetesNo ? "Checked" : "",
      ],
      [
        "g. Hypertension",
        form.hypertensionYes ? "Checked" : "",
        form.hypertensionNo ? "Checked" : "",
      ],
      [
        "h. Seizures/Convulsions",
        form.seizuresYes ? "Checked" : "",
        form.seizuresNo ? "Checked" : "",
      ],
      [
        "i. Mental illness",
        form.mentalIllnessYes ? "Checked" : "",
        form.mentalIllnessNo ? "Checked" : "",
      ],
    ];
    let y = renderTableWithBorders(
      doc,
      doc.y + 10,
      sectionARows,
      [
        "A) Do you suffer from or have you suffered from any of the following?",
        "Yes",
        "No",
      ],
      colWidths
    );
    doc.x = 50;
    doc.moveDown(2);

    // Page 2: Table B and Table C
    doc.addPage();
    doc.y = 15; // Reset y position for the new page

    // Section B (Table B)
    const sectionBRows = [
      [
        "1. Tuberculosis",
        form.familyTuberculosisYes ? "Checked" : "",
        form.familyTuberculosisNo ? "Checked" : "",
      ],
      [
        "2. Mental illness or insanity",
        form.familyMentalIllnessYes ? "Checked" : "",
        form.familyMentalIllnessNo ? "Checked" : "",
      ],
      [
        "3. Diabetes Mellitus",
        form.familyDiabetesYes ? "Checked" : "",
        form.familyDiabetesNo ? "Checked" : "",
      ],
      [
        "4. Heart Disease",
        form.familyHeartDiseaseYes ? "Checked" : "",
        form.familyHeartDiseaseNo ? "Checked" : "",
      ],
    ];
    y = renderTableWithBorders(
      doc,
      doc.y + 10,
      sectionBRows,
      ["B) Has any member of your family suffered from:", "Yes", "No"],
      colWidths
    );
    doc.x = 50;
    doc.moveDown(2);

    // Section C (Table C)
    const sectionCRows = [
      [
        "1. Small pox",
        form.smallpoxYes ? "Checked" : "",
        form.smallpoxNo ? "Checked" : "",
      ],
      [
        "2. Poliomyelitis",
        form.poliomyelitisYes ? "Checked" : "",
        form.poliomyelitisNo ? "Checked" : "",
      ],
      [
        "3. Tuberculosis",
        form.immunizationTuberculosisYes ? "Checked" : "",
        form.immunizationTuberculosisNo ? "Checked" : "",
      ],
      [
        "4. Meningitis",
        form.meningitisYes ? "Checked" : "",
        form.meningitisNo ? "Checked" : "",
      ],
      [
        "5. Human Papilloma Virus (for females only)",
        form.hpvYes ? "Checked" : "",
        form.hpvNo ? "Checked" : "",
      ],
      [
        "6. Hepatitis B",
        form.hepatitisBYes ? "Checked" : "",
        form.hepatitisBNo ? "Checked" : "",
      ],
    ];

    /* if (form.sex === "Female") {
          sectionCRows.push([
            "5. Human Papilloma Virus (for females only)",
            form.hpvYes ? "Checked" : "",
            form.hpvNo ? "Checked" : "",
          ]),
            sectionCRows.push([
              "6. Hepatitis B",
              form.hepatitisBYes ? "Checked" : "",
              form.hepatitisBNo ? "Checked" : "",
            ]);
        } else {
          sectionCRows.push([
            "5. Hepatitis B",
            form.hepatitisBYes ? "Checked" : "",
            form.hepatitisBNo ? "Checked" : "",
          ]);
        }*/

    // Add Additional Questions to Section C table
    sectionCRows.push([
      "Do you currently use tobacco products such as cigarettes, snuff etc?",
      form.tobaccoUseYes ? "Checked" : "",
      form.tobaccoUseNo ? "Checked" : "",
    ]);
    sectionCRows.push([
      "Do you have someone at home/school/hostel who smokes when you are present?",
      form.secondhandSmokeYes ? "Checked" : "",
      form.secondhandSmokeNo ? "Checked" : "",
    ]);
    sectionCRows.push([
      "Do you currently consume alcohol?",
      form.alcoholConsumptionYes ? "Checked" : "",
      form.alcoholConsumptionNo ? "Checked" : "",
    ]);

    // Add the details rows to Section C table
    if (
      form.tobaccoUseYes ||
      form.secondhandSmokeYes ||
      form.alcoholConsumptionYes
    ) {
      sectionCRows.push([
        `If the answer to any of the above is Yes, provide details: ${form.tobaccoAlcoholDetails}`,
        "",
        "",
      ]);
    }
    sectionCRows.push([
      `If there is any other relevant medical information not stated above, please provide details: ${form.otherMedicalInfo}`,
      "",
      "",
    ]);
    y = renderTableWithBorders(
      doc,
      doc.y + 10,
      sectionCRows,
      [
        "C) Have you been immunized against any of the following diseases:",
        "Yes",
        "No",
      ],
      colWidths
    );
    doc.x = 50;
    doc.moveDown(2);

    // Page 3: Part II and Part III
    // doc.addPage();
    doc.y = 580; // Reset y position for the new page

    // Part II and Part III (Placeholders)
    doc
      .fontSize(12)
      .text("Part II Clinical Examination: (To be completed by clinic staff)", {
        underline: true,
        align: "left",
      })
      .moveDown();
    doc.fontSize(10);
    doc.text(
      `(a) Height:  __________________ (b) Weight:   __________________ (c) BMI:   __________________`,
      {
        align: "left",
      }
    );
    doc.text(
      `(d) Visual Acuity (R)  __________________ (L)   __________________`,
      { align: "left" }
    );
    doc
      .text(
        `(e) Blood Pressure (BP):   __________________ (f) Pulse rate (PR):   __________________`,
        {
          align: "left",
        }
      )
      .moveDown();

    doc
      .fontSize(12)
      .text(
        "Part III Laboratory Investigations: (To be completed by clinic staff)",
        { underline: true, align: "left" }
      )
      .moveDown();
    doc.fontSize(10);
    doc.text(`Urine __________________`, { align: "left" });
    doc.text(`Albumin   __________________`, { align: "left" });
    doc.text(`Sugar   __________________`, { align: "left" });
    doc.text(`Genotype  __________________`, { align: "left" });
    doc.text(`Blood Group  __________________`, { align: "left" });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });
    console.log(res);
  } catch (err) {
    console.error("Error saving form:", err);
    if (!res.headersSent) {
      return res.status(500).json({ message: "Error generating PDF" });
    }
  } finally {
    if (filePath && fs.existsSync(filePath)) {
      try {
        fs.unlinkSync(filePath);
      } catch (unlinkErr) {
        console.error("Error deleting temp file:", unlinkErr);
      }
    }
  }
};

const pdfUpdateController = async (req, res) => {
  let filePath;
  try {
    const formData = req.body;

    let existingForm = await Form.findOne({ matricNo: formData.matricNo });

    if (existingForm) {
      await Form.updateOne({ matricNo: formData.matricNo }, formData);
      console.log("Form updated");
    } else {
      const newForm = new Form(formData);
      await newForm.save();
      console.log("Form saved");
    }

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `${formData.surname}-${formData.otherNames}-updated-questionnaire-response.pdf`;
    filePath = path.join(
      __dirname,
      "..",
      "admin_updated_questionnaire_files",
      fileName
    );

    if (!fs.existsSync(path.dirname(filePath))) {
      fs.mkdirSync(path.dirname(filePath), { recursive: true });
    }

    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.pipe(res);

    // Page 1: Header, Student Details, and Table A
    doc
      .fontSize(14)
      .text("FEDERAL UNIVERSITY OF HEALTH SCIENCES, ILA ORANGUN", {
        align: "center",
      });
    doc.moveDown(1);
    doc
      .fontSize(12)
      .text("MEDICAL ENTRANCE SCREENING EXAMINATION FORM FOR STUDENTS", {
        align: "center",
      });
    doc.moveDown(1);
    doc
      .fontSize(10)
      .text(
        "Student is requested to complete part I of this form, parts II & III will be completed by the designated officers at the University health center. The completed form should be forwarded to the Medical Director, University Health Services and archived in the students clinical folder.",
        {
          align: "justify",
        }
      );
    doc.moveDown(1);

    doc
      .fontSize(12)
      .text("PART I", { underline: true, align: "left" })
      .moveDown();
    doc.fontSize(10);
    doc.text(`Surname: ${formData.surname}`, { align: "left" }).moveDown(0.5);
    doc
      .text(`Other Names: ${formData.otherNames}`, { align: "left" })
      .moveDown(0.5);
    doc
      .text(
        `Age: ${formData.age}  |  Date of Birth: ${formData.dob}  |  Sex: ${formData.sex}`,
        { align: "left" }
      )
      .moveDown(0.5);
    doc
      .text(`Nationality: ${formData.nationality} | State: ${formData.state}`, {
        align: "left",
      })
      .moveDown(0.5);
    doc
      .text(
        `Marital Status: ${formData.maritalStatus} | Faculty: ${formData.faculty}`,
        { align: "left" }
      )
      .moveDown(0.5);
    doc
      .text(
        `Matric No: ${formData.matricNo} | Jamb Reg No: ${formData.jambRegNo}`,
        { align: "left" }
      )
      .moveDown(0.5);
    doc
      .text(`Department: ${formData.department} | Tel No: ${formData.telNo}`, {
        align: "left",
      })
      .moveDown(0.5);
    doc.text(`Religion: ${formData.religion}`, { align: "left" }).moveDown(0.5);
    doc.text(`For Emergencies:`, { align: "left" }).moveDown(0.5);
    doc
      .text(
        `Next of Kin: ${formData.nextOfKinName} (${formData.relationship})`,
        {
          align: "left",
        }
      )
      .moveDown(0.5);
    doc
      .text(`Address: ${formData.nextOfKinAddress}`, { align: "left" })
      .moveDown(0.5);
    doc.text(`Tel: ${formData.nextOfKinTel}`, { align: "left" }).moveDown(1);

    // Tables
    const colWidths = [350, 50, 50];
    // const "Checked" = "\u2714"; // Bold "Checked" (✔)

    // Section A (Table A)
    const sectionARows = [
      [
        "a. Tuberculosis",
        formData.tuberculosisYes ? "Checked" : "",
        formData.tuberculosisNo ? "Checked" : "",
      ],
      [
        "b. Asthma",
        formData.asthmaYes ? "Checked" : "",
        formData.asthmaNo ? "Checked" : "",
      ],
      [
        "c. Peptic Ulcer Disease",
        formData.pepticUlcerYes ? "Checked" : "",
        formData.pepticUlcerNo ? "Checked" : "",
      ],
      [
        "d. Sickle cell disease",
        formData.sickleCellYes ? "Checked" : "",
        formData.sickleCellNo ? "Checked" : "",
      ],
      [
        "e. Allergies",
        formData.allergiesYes ? "Checked" : "",
        formData.allergiesNo ? "Checked" : "",
      ],
      [
        "f. Diabetes",
        formData.diabetesYes ? "Checked" : "",
        formData.diabetesNo ? "Checked" : "",
      ],
      [
        "g. Hypertension",
        formData.hypertensionYes ? "Checked" : "",
        formData.hypertensionNo ? "Checked" : "",
      ],
      [
        "h. Seizures/Convulsions",
        formData.seizuresYes ? "Checked" : "",
        formData.seizuresNo ? "Checked" : "",
      ],
      [
        "i. Mental illness",
        formData.mentalIllnessYes ? "Checked" : "",
        formData.mentalIllnessNo ? "Checked" : "",
      ],
    ];
    let y = renderTableWithBorders(
      doc,
      doc.y + 10,
      sectionARows,
      [
        "A) Do you suffer from or have you suffered from any of the following?",
        "Yes",
        "No",
      ],
      colWidths
    );
    doc.x = 50;
    doc.moveDown(2);

    // Page 2: Table B and Table C
    doc.addPage();
    doc.y = 15; // Reset y position for the new page

    // Section B (Table B)
    const sectionBRows = [
      [
        "1. Tuberculosis",
        formData.familyTuberculosisYes ? "Checked" : "",
        formData.familyTuberculosisNo ? "Checked" : "",
      ],
      [
        "2. Mental illness or insanity",
        formData.familyMentalIllnessYes ? "Checked" : "",
        formData.familyMentalIllnessNo ? "Checked" : "",
      ],
      [
        "3. Diabetes Mellitus",
        formData.familyDiabetesYes ? "Checked" : "",
        formData.familyDiabetesNo ? "Checked" : "",
      ],
      [
        "4. Heart Disease",
        formData.familyHeartDiseaseYes ? "Checked" : "",
        formData.familyHeartDiseaseNo ? "Checked" : "",
      ],
    ];
    y = renderTableWithBorders(
      doc,
      doc.y + 10,
      sectionBRows,
      ["B) Has any member of your family suffered from:", "Yes", "No"],
      colWidths
    );
    doc.x = 50;
    doc.moveDown(2);

    // Section C (Table C)
    const sectionCRows = [
      [
        "1. Small pox",
        formData.smallpoxYes ? "Checked" : "",
        formData.smallpoxNo ? "Checked" : "",
      ],
      [
        "2. Poliomyelitis",
        formData.poliomyelitisYes ? "Checked" : "",
        formData.poliomyelitisNo ? "Checked" : "",
      ],
      [
        "3. Tuberculosis",
        formData.immunizationTuberculosisYes ? "Checked" : "",
        formData.immunizationTuberculosisNo ? "Checked" : "",
      ],
      [
        "4. Meningitis",
        formData.meningitisYes ? "Checked" : "",
        formData.meningitisNo ? "Checked" : "",
      ],
      [
        "5. Human Papilloma Virus (for females only)",
        formData.hpvYes ? "Checked" : "",
        formData.hpvNo ? "Checked" : "",
      ],
      [
        "6. Hepatitis B",
        formData.hepatitisBYes ? "Checked" : "",
        formData.hepatitisBNo ? "Checked" : "",
      ],
    ];

    /* if (formData.sex === "Female") {
          sectionCRows.push([
            "5. Human Papilloma Virus (for females only)",
            formData.hpvYes ? "Checked" : "",
            formData.hpvNo ? "Checked" : "",
          ]),
            sectionCRows.push([
              "6. Hepatitis B",
              formData.hepatitisBYes ? "Checked" : "",
              formData.hepatitisBNo ? "Checked" : "",
            ]);
        } else {
          sectionCRows.push([
            "5. Hepatitis B",
            formData.hepatitisBYes ? "Checked" : "",
            formData.hepatitisBNo ? "Checked" : "",
          ]);
        }*/

    // Add Additional Questions to Section C table
    sectionCRows.push([
      "Do you currently use tobacco products such as cigarettes, snuff etc?",
      formData.tobaccoUseYes ? "Checked" : "",
      formData.tobaccoUseNo ? "Checked" : "",
    ]);
    sectionCRows.push([
      "Do you have someone at home/school/hostel who smokes when you are present?",
      formData.secondhandSmokeYes ? "Checked" : "",
      formData.secondhandSmokeNo ? "Checked" : "",
    ]);
    sectionCRows.push([
      "Do you currently consume alcohol?",
      formData.alcoholConsumptionYes ? "Checked" : "",
      formData.alcoholConsumptionNo ? "Checked" : "",
    ]);

    // Add the details rows to Section C table
    if (
      formData.tobaccoUseYes ||
      formData.secondhandSmokeYes ||
      formData.alcoholConsumptionYes
    ) {
      sectionCRows.push([
        `If the answer to any of the above is Yes, provide details: ${formData.tobaccoAlcoholDetails}`,
        "",
        "",
      ]);
    }
    sectionCRows.push([
      `If there is any other relevant medical information not stated above, please provide details: ${formData.otherMedicalInfo}`,
      "",
      "",
    ]);
    y = renderTableWithBorders(
      doc,
      doc.y + 10,
      sectionCRows,
      [
        "C) Have you been immunized against any of the following diseases:",
        "Yes",
        "No",
      ],
      colWidths
    );
    doc.x = 50;
    doc.moveDown(2);

    // Page 3: Part II and Part III
    // doc.addPage();
    doc.y = 580; // Reset y position for the new page

    // Part II and Part III (Placeholders)
    doc
      .fontSize(12)
      .text("Part II Clinical Examination: (To be completed by clinic staff)", {
        underline: true,
        align: "left",
      })
      .moveDown();
    doc.fontSize(10);
    doc.text(
      `(a) Height:  ${formData.height} (b) Weight:   ${formData.weight} (c) BMI:   ${formData.bmi}`,
      {
        align: "left",
      }
    );
    doc.text(
      `(d) Visual Acuity (R)  ${formData.visualAcuityRight} (L)   ${formData.visualAcuityLeft}`,
      { align: "left" }
    );
    doc
      .text(
        `(e) Blood Pressure (BP):   ${formData.bloodPressure} (f) Pulse rate (PR):   ${formData.pulseRate}`,
        {
          align: "left",
        }
      )
      .moveDown();

    doc
      .fontSize(12)
      .text(
        "Part III Laboratory Investigations: (To be completed by clinic staff)",
        { underline: true, align: "left" }
      )
      .moveDown();
    doc.fontSize(10);
    doc.text(`Urine ${formData.urine}`, { align: "left" });
    doc.text(`Albumin   ${formData.albumin}`, { align: "left" });
    doc.text(`Sugar   ${formData.sugar}`, { align: "left" });
    doc.text(`Genotype  ${formData.genotype}`, { align: "left" });
    doc.text(`Blood Group  ${formData.bloodGroup}`, { align: "left" });

    doc.end();

    await new Promise((resolve, reject) => {
      stream.on("finish", resolve);
      stream.on("error", reject);
    });

    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Error sending file:", err);
        if (!res.headersSent) {
          res.status(500).send("Error sending file");
        }
      }

      // // Clean up the file
      // if (fs.existsSync(filePath)) {
      //     try {
      //         fs.unlinkSync(filePath);
      //     } catch (unlinkErr) {
      //         console.error('Error deleting temp file:', unlinkErr);
      //     }
      // }
    });
  } catch (err) {
    console.error("Error updating form:", err);

    // if (filePath && fs.existsSync(filePath)) {
    //     try {
    //         fs.unlinkSync(filePath);
    //     } catch (unlinkErr) {
    //         console.error('Error deleting temp file:', unlinkErr);
    //     }
    // }

    if (!res.headersSent) {
      res.status(500).json({ message: "Error generating PDF" });
    }
  }
};
module.exports = { pdfController, pdfDownloadController, pdfUpdateController };
