const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const checkPageBreak = (doc, contentHeight, margin = 50) => {
  const pageHeight = doc.page.height;
  if (doc.y + contentHeight > pageHeight - margin) {
    doc.addPage();
    return true;
  }
  return false;
};

const generatePDF = (formData) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const fileName = `${formData.name.replace(/\s/g, "_")}_${Date.now()}.pdf`;
    const filePath = path.join(__dirname, "../pdfs", fileName);

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    doc
      .fontSize(14)
      .text("FEDERAL UNIVERSITY OF HEALTH SCIENCES, ILA ORANGUN", {
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
      .text(
        "Student is requested to complete part I of this form, parts II & III will be completed by the designated officers at the University health center. The completed form should be forwarded to the Medical Director, University Health Services and archived in the students clinical folder.",
        { align: "justify" }
      );
    doc.moveDown();

    doc.fontSize(12).text("PART I", { underline: true });
    doc.moveDown();

    // Personal Information
    doc.fontSize(10);
    checkPageBreak(doc, 100);
    doc.text(`Surname: ${formData.surname} `);
    doc.text(`Other Names: ${formData.otherNames} `);
    doc.text(
      `Age: ${formData.age}    Date of Birth: ${formData.dob}    Sex: ${formData.sex}`
    );
    doc.text(
      `Nationality: ${formData.nationality}    State: ${formData.state}`
    );
    doc.text(
      `Marital Status: ${formData.maritalStatus}    Faculty: ${formData.faculty}`
    );
    doc.text(
      `Matric No: ${formData.matricNo}    Jamb Reg No: ${formData.jambRegNo}    Department: ${formData.department}`
    );
    doc.text(`Tel No: ${formData.telNo}    Religion: ${formData.religion}`);
    doc.moveDown();

    // Emergency Contact
    // Emergency Contact
    checkPageBreak(doc, 80);
    doc.text(`For Emergencies:`);
    doc.text(`Name of Next of Kin: ${formData.nextOfKinName} `);
    doc.text(`Relationship to Next of Kin: ${formData.relationship} `);
    doc.text(`Address of Next of Kin: ${formData.nextOfKinAddress} `);
    doc.text(`Telephone No of Next of Kin: ${formData.nextOfKinTel} `);
    doc.moveDown();

    // Section A: Table for Medical History
    checkPageBreak(doc, 30);

    const startX = 50;
    const startY = 150;
    const col1Width = 300;
    const col2Width = 50;
    const col3Width = 50;
    const rowHeight = 20;

    const headers = [
      "A) Do you suffer from or have you suffered from any of the following?",
      "Yes",
      "No",
    ];
    const tableRowsA = [
      [
        "a. Tuberculosis",
        formData.tuberculosisYes ? "√" : "",
        formData.tuberculosisNo ? "√" : "",
      ],
      [
        "b. Asthma",
        formData.asthmaYes ? "√" : "",
        formData.asthmaNo ? "√" : "",
      ],
      [
        "c. Peptic Ulcer Disease",
        formData.pepticUlcerYes ? "√" : "",
        formData.pepticUlcerNo ? "√" : "",
      ],
      [
        "d. Sickle cell disease",
        formData.sickleCellYes ? "√" : "",
        formData.sickleCellNo ? "√" : "",
      ],
      [
        "e. Allergies",
        formData.allergiesYes ? "√" : "",
        formData.allergiesNo ? "√" : "",
      ],
      [
        "f. Diabetes",
        formData.diabetesYes ? "√" : "",
        formData.diabetesNo ? "√" : "",
      ],
      [
        "g. Hypertension",
        formData.hypertensionYes ? "√" : "",
        formData.hypertensionNo ? "√" : "",
      ],
      [
        "h. Seizures/Convulsions",
        formData.seizuresYes ? "√" : "",
        formData.seizuresNo ? "√" : "",
      ],
      [
        "i. Mental illness",
        formData.mentalIllnessYes ? "√" : "",
        formData.mentalIllnessNo ? "√" : "",
      ],
    ];

    // Draw table header
    let y = startY;
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .text(headers[0], startX, y, { width: col1Width })
      .text(headers[1], startX + col1Width, y, {
        width: col2Width,
        align: "center",
      })
      .text(headers[2], startX + col1Width + col2Width, y, {
        width: col3Width,
        align: "center",
      });

    y += rowHeight;
    doc.font("Helvetica").fontSize(11);

    // Draw table rows
    tableRowsA.forEach((row) => {
      // Optional: Add a page break if necessary
      if (y + rowHeight > doc.page.height - 50) {
        doc.addPage();
        y = 50;
      }

      doc
        .text(row[0], startX, y, { width: col1Width })
        .text(row[1], startX + col1Width, y, {
          width: col2Width,
          align: "center",
        })
        .text(row[2], startX + col1Width + col2Width, y, {
          width: col3Width,
          align: "center",
        });

      y += rowHeight;
    });

    doc.moveDown();

    doc.writeStream.on("finish", () => resolve(filePath));
    writeStream.on("error", reject);
  });
};

module.exports = generatePDF;
