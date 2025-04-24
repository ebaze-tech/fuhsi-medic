const express = require("express");
const mongoose = require("mongoose");
const PDFDocument = require("pdfkit");
const fs = require("fs");
const app = express();
const cors = require("cors");
require("dotenv").config();

const PORT = process.env.PORT || 3001;

const allowedOrigins = ["http://localhost:5174"];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.DB_URI, {})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => {
    console.error("MongoDB connection failed:", err);
    process.exit(1);
  });

// Define Mongoose Schema
const formSchema = new mongoose.Schema(
  {
    surname: String,
    otherNames: String,
    age: String,
    dob: String,
    sex: String,
    nationality: String,
    state: String,
    maritalStatus: String,
    faculty: String,
    matricNo: String,
    jambRegNo: String,
    department: String,
    telNo: String,
    religion: String,
    nextOfKinName: String,
    relationship: String,
    nextOfKinAddress: String,
    nextOfKinTel: String,
    tuberculosisYes: Boolean,
    tuberculosisNo: Boolean,
    asthmaYes: Boolean,
    asthmaNo: Boolean,
    pepticUlcerYes: Boolean,
    pepticUlcerNo: Boolean,
    sickleCellYes: Boolean,
    sickleCellNo: Boolean,
    allergiesYes: Boolean,
    allergiesNo: Boolean,
    diabetesYes: Boolean,
    diabetesNo: Boolean,
    hypertensionYes: Boolean,
    hypertensionNo: Boolean,
    seizuresYes: Boolean,
    seizuresNo: Boolean,
    mentalIllnessYes: Boolean,
    mentalIllnessNo: Boolean,
    familyTuberculosisYes: Boolean,
    familyTuberculosisNo: Boolean,
    familyMentalIllnessYes: Boolean,
    familyMentalIllnessNo: Boolean,
    familyDiabetesYes: Boolean,
    familyDiabetesNo: Boolean,
    familyHeartDiseaseYes: Boolean,
    familyHeartDiseaseNo: Boolean,
    smallpoxYes: Boolean,
    smallpoxNo: Boolean,
    poliomyelitisYes: Boolean,
    poliomyelitisNo: Boolean,
    immunizationTuberculosisYes: Boolean,
    immunizationTuberculosisNo: Boolean,
    meningitisYes: Boolean,
    meningitisNo: Boolean,
    hpvYes: Boolean,
    hpvNo: Boolean,
    hepatitisBYes: Boolean,
    hepatitisBNo: Boolean,
    tobaccoUseYes: Boolean,
    tobaccoUseNo: Boolean,
    secondhandSmokeYes: Boolean,
    secondhandSmokeNo: Boolean,
    alcoholConsumptionYes: Boolean,
    alcoholConsumptionNo: Boolean,
    tobaccoAlcoholDetails: String,
    otherMedicalInfo: String,
  },
  { timestamps: true }
);

const Form = mongoose.model("Form", formSchema);

// Helper function to check and add page
const checkPageBreak = (doc, contentHeight, margin = 50) => {
  const pageHeight = doc.page.height;
  if (doc.y + contentHeight > pageHeight - margin) {
    doc.addPage();
  }
};

// Helper to draw a table
const renderTableWithBorders = (doc, startY, rows, headers, colWidths) => {
  let y = startY;
  const rowHeight = 20;
  const tableLeft = 50;
  const colPositions = [tableLeft];

  // Calculate column positions based on widths
  for (let i = 0; i < colWidths.length; i++) {
    colPositions.push(colPositions[i] + colWidths[i]);
  }

  // Draw header background
  doc
    .rect(
      tableLeft,
      y,
      colWidths.reduce((a, b) => a + b),
      rowHeight
    )
    .fillAndStroke("#f0f0f0", "black");

  // Draw header text
  doc.fillColor("black").font("Helvetica-Bold").fontSize(11);
  headers.forEach((text, i) => {
    doc.text(text, colPositions[i] + 5, y + 5, {
      width: colWidths[i] - 10,
      align: i === 0 ? "left" : "center",
    });
  });

  y += rowHeight;

  doc.font("Helvetica").fontSize(10);

  // Draw table rows
  rows.forEach((row) => {
    // Check if row fits on current page
    if (y + rowHeight > doc.page.height - 50) {
      doc.addPage();
      y = 50;

      // Redraw headers on new page
      doc
        .rect(
          tableLeft,
          y,
          colWidths.reduce((a, b) => a + b),
          rowHeight
        )
        .fillAndStroke("#f0f0f0", "black");

      doc.fillColor("black").font("Helvetica-Bold").fontSize(11);
      headers.forEach((text, i) => {
        doc.text(text, colPositions[i] + 5, y + 5, {
          width: colWidths[i] - 10,
          align: i === 0 ? "left" : "center",
        });
      });

      y += rowHeight;
      doc.font("Helvetica").fontSize(10);
    }

    // Draw row background and borders
    doc
      .fillColor("white")
      .rect(
        tableLeft,
        y,
        colWidths.reduce((a, b) => a + b),
        rowHeight
      )
      .stroke();

    // Draw each cell in row
    row.forEach((cell, i) => {
      doc.text(cell, colPositions[i] + 5, y + 5, {
        width: colWidths[i] - 10,
        align: i === 0 ? "left" : "center",
      });

      // Draw vertical line between columns
      doc
        .moveTo(colPositions[i + 1], y)
        .lineTo(colPositions[i + 1], y + rowHeight)
        .stroke();
    });

    // Draw bottom line for the row
    doc
      .moveTo(tableLeft, y + rowHeight)
      .lineTo(colPositions[colPositions.length - 1], y + rowHeight)
      .stroke();

    y += rowHeight;
  });

  return y;
};

// Handle form submission and PDF generation
app.post("/generate-pdf", async (req, res) => {
  const formData = req.body;

  try {
    const newForm = new Form(formData);
    await newForm.save();
    console.log("Form saved");
  } catch (err) {
    console.error("Error saving form:", err);
    return res.status(500).send("Database error");
  }

  const doc = new PDFDocument({ margin: 50 });
  const fileName = "questionnaire.pdf";
  const stream = fs.createWriteStream(fileName);
  doc.pipe(stream);

  doc.fontSize(14).text("FEDERAL UNIVERSITY OF HEALTH SCIENCES, ILA ORANGUN", {
    align: "center",
  });
  doc.moveDown();
  doc
    .fontSize(12)
    .text("MEDICAL ENTRANCE SCREENING EXAMINATION FORM FOR STUDENTS", {
      align: "center",
    });
  doc.moveDown();
  doc
    .fontSize(10)
    .text("Student is requested to complete part I of this form...", {
      align: "justify",
    });
  doc.moveDown();

  doc.fontSize(12).text("PART I", { underline: true }).moveDown();
  doc.fontSize(10).text(`Surname: ${formData.surname}`);
  doc.text(`Other Names: ${formData.otherNames}`);
  doc.text(
    `Age: ${formData.age}  |  Date of Birth: ${formData.dob}  |  Sex: ${formData.sex}`
  );
  doc.text(`Nationality: ${formData.nationality} | State: ${formData.state}`);
  doc.text(
    `Marital Status: ${formData.maritalStatus} | Faculty: ${formData.faculty}`
  );
  doc.text(
    `Matric No: ${formData.matricNo} | Jamb Reg No: ${formData.jambRegNo}`
  );
  doc.text(`Department: ${formData.department} | Tel No: ${formData.telNo}`);
  doc.text(`Religion: ${formData.religion}`).moveDown();
  doc.text(`Next of Kin: ${formData.nextOfKinName} (${formData.relationship})`);
  doc.text(`Address: ${formData.nextOfKinAddress}`);
  doc.text(`Tel: ${formData.nextOfKinTel}`).moveDown();

  // Tables
  const colWidths = [300, 50, 50];

  // Section A
  doc.fontSize(12).text("A) Personal Medical History").moveDown();
  const sectionARows = [
    [
      "a. Tuberculosis",
      formData.tuberculosisYes ? "✓" : "",
      formData.tuberculosisNo ? "✓" : "",
    ],
    ["b. Asthma", formData.asthmaYes ? "✓" : "", formData.asthmaNo ? "✓" : ""],
    [
      "c. Peptic Ulcer",
      formData.pepticUlcerYes ? "✓" : "",
      formData.pepticUlcerNo ? "✓" : "",
    ],
    [
      "d. Sickle Cell",
      formData.sickleCellYes ? "✓" : "",
      formData.sickleCellNo ? "✓" : "",
    ],
    [
      "e. Allergies",
      formData.allergiesYes ? "✓" : "",
      formData.allergiesNo ? "✓" : "",
    ],
    [
      "f. Diabetes",
      formData.diabetesYes ? "✓" : "",
      formData.diabetesNo ? "✓" : "",
    ],
    [
      "g. Hypertension",
      formData.hypertensionYes ? "✓" : "",
      formData.hypertensionNo ? "✓" : "",
    ],
    [
      "h. Seizures",
      formData.seizuresYes ? "✓" : "",
      formData.seizuresNo ? "✓" : "",
    ],
    [
      "i. Mental Illness",
      formData.mentalIllnessYes ? "✓" : "",
      formData.mentalIllnessNo ? "✓" : "",
    ],
  ];
  let y = renderTableWithBorders(
    doc,
    doc.y + 10,
    sectionARows,
    // ["Condition", "Yes", "No"],
    colWidths
  );
  doc.moveDown();

  // Section B
  doc.fontSize(12).text("B) Family History").moveDown();
  const sectionBRows = [
    [
      "1. Tuberculosis",
      formData.familyTuberculosisYes ? "✓" : "",
      formData.familyTuberculosisNo ? "✓" : "",
    ],
    [
      "2. Mental Illness",
      formData.familyMentalIllnessYes ? "✓" : "",
      formData.familyMentalIllnessNo ? "✓" : "",
    ],
    [
      "3. Diabetes",
      formData.familyDiabetesYes ? "✓" : "",
      formData.familyDiabetesNo ? "✓" : "",
    ],
    [
      "4. Heart Disease",
      formData.familyHeartDiseaseYes ? "✓" : "",
      formData.familyHeartDiseaseNo ? "✓" : "",
    ],
  ];
  y = renderTableWithBorders(
    doc,
    doc.y + 10,
    sectionBRows,
    // ["Family Condition", "Yes", "No"],
    colWidths
  );
  doc.moveDown();

  // Section C
  doc.fontSize(12).text("C) Immunization History").moveDown();
  const sectionCRows = [
    [
      "1. Smallpox",
      formData.smallpoxYes ? "✓" : "",
      formData.smallpoxNo ? "✓" : "",
    ],
    [
      "2. Poliomyelitis",
      formData.poliomyelitisYes ? "✓" : "",
      formData.poliomyelitisNo ? "✓" : "",
    ],
    [
      "3. Tuberculosis",
      formData.immunizationTuberculosisYes ? "✓" : "",
      formData.immunizationTuberculosisNo ? "✓" : "",
    ],
    [
      "4. Meningitis",
      formData.meningitisYes ? "✓" : "",
      formData.meningitisNo ? "✓" : "",
    ],
  ];

  if (formData.sex === "Female") {
    sectionCRows.push([
      "5. HPV",
      formData.hpvYes ? "✓" : "",
      formData.hpvNo ? "✓" : "",
    ]);
    sectionCRows.push([
      "6. Hepatitis B",
      formData.hepatitisBYes ? "✓" : "",
      formData.hepatitisBNo ? "✓" : "",
    ]);
  }

  renderTableWithBorders(
    doc,
    doc.y + 10,
    sectionCRows,
    // ["Vaccine", "Yes", "No"],
    colWidths
  );

  doc.end();

  stream.on("finish", () => {
    res.download(fileName, (err) => {
      if (err) res.status(500).send("Error sending file");
      fs.unlinkSync(fileName); // Delete file after download
    });
  });
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
