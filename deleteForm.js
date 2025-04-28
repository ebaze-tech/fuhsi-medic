// deleteDuplicateForms.js
const mongoose = require("mongoose");
require("dotenv").config();

// Import your Form model
const Form = require("./model/formSchema"); // Adjust if your path is different

const DB_URI = process.env.DB_URI;

async function deleteDuplicateForms() {
  try {
    await mongoose.connect(process.env.DB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log("✅ Connected to MongoDB");

    // 1. Find duplicates (group by surname + otherNames)
    const duplicates = await Form.aggregate([
      {
        $group: {
          _id: { surname: "$surname", otherNames: "$otherNames" },
          ids: { $addToSet: "$_id" },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gt: 1 } } },
    ]);

    console.log(`🕵️ Found ${duplicates.length} duplicate groups.`);

    let totalDeleted = 0;

    for (const doc of duplicates) {
      // 2. Keep one ID, delete the rest
      const [keepId, ...deleteIds] = doc.ids;

      if (deleteIds.length > 0) {
        const result = await Form.deleteMany({ _id: { $in: deleteIds } });
        totalDeleted += result.deletedCount;
      }
    }

    console.log(`🗑️ Deleted ${totalDeleted} duplicate forms.`);
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    mongoose.connection.close();
    console.log("🔒 MongoDB connection closed");
  }
}

deleteDuplicateForms();
