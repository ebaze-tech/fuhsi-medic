const mongoose = require("mongoose");
const XLSX = require("xlsx");
const User = require("./model/userSchema");
require("dotenv").config();

mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log("Connected to MongoDB");
}).catch((err) => {
    console.error("MongoDB connection error:", err);
});

// Function to Seed Users
async function seedUsers() {
    try {
        // Load Excel file using file path
        const workbook = XLSX.readFile("./matric-fuhsi-medical.xlsx");
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Convert Excel to JSON
        const usersData = XLSX.utils.sheet_to_json(worksheet);

        // Map Excel fields to your schema
        const users = usersData.map(user => ({
            utmeNo: user.utmeNo,
            surname: user.surname,
            otherNames: user.otherNames
        }));

        // Insert into database
        await User.insertMany(users);
        console.log("Users seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("Error seeding users:", error);
        process.exit(1);
    }
}

seedUsers();