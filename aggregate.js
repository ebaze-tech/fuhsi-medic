const { MongoClient } = require("mongodb");
require("dotenv").config();

// Replace with your MongoDB Atlas connection string
const uri = process.env.DB_URI;

const client = new MongoClient(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db(process.env.DB_NAME);
    const users = database.collection("users");

    const pipeline = [
      {
        $group: {
          _id: "$surname",
          names: { $addToSet: "$otherNames" },
          users: { $push: "$$ROOT" },
          count: { $sum: 1 },
        },
      },
      {
        $match: {
          "names.1": { $exists: true }, // More than one unique otherName
        },
      },
      {
        $unwind: "$users",
      },
      {
        $replaceRoot: { newRoot: "$users" },
      },
    ];

    const cursor = users.aggregate(pipeline);
    const results = await cursor.toArray();

    console.log("Users with same surname but different otherNames:");
    results.forEach((user) => {
      console.log(user);
    });
  } catch (error) {
    console.error("Error running aggregation:", error);
  } finally {
    await client.close();
  }
}

run();
