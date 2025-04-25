const PDFDocument = require("pdfkit")
const fs = require("fs")
const { renderTableWithBorders } = require("../utils/utils")
const Form = require("../model")

const pdfController = async (req, res) => {
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
    const fileName = "questionnaire-response.pdf";
    const stream = fs.createWriteStream(fileName);
    doc.pipe(stream);

    // Page 1: Header, Student Details, and Table A
    doc.fontSize(14).text("FEDERAL UNIVERSITY OF HEALTH SCIENCES, ILA ORANGUN", {
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
        .text(`Next of Kin: ${formData.nextOfKinName} (${formData.relationship})`, {
            align: "left",
        })
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

    stream.on("finish", () => {
        res.download(fileName, (err) => {
            if (err) res.status(500).send("Error sending file");
            // fs.unlinkSync(fileName); // Delete file after download
        });
    });
};

module.exports = { pdfController }