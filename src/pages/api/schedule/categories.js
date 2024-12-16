import { ObjectId } from "mongodb";
import connectDB from "@/lib/schedule.db";

export default async function handler(req, res) {
  const client = await connectDB();
  const db = client.db("Data");
  const collection = db.collection("Categories");

  if (req.method === "GET") {
    // Fetch all categories
    try {
      const categories = await collection.find({}).toArray();
      res.status(200).json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories", error });
    }
  } else if (req.method === "POST") {
    // Create or update a category
    try {
      const { _id, name, color } = req.body;

      if (!_id) {
        // Create a new category
        const result = await collection.insertOne({ name, color });
        res.status(201).json({
          message: "Category created",
          upsertedId: result.insertedId,
        });
      } else {
        // Update an existing category
        const result = await collection.updateOne(
          { _id: new ObjectId(_id) },
          { $set: { name, color } },
          { upsert: true }
        );
        res.status(200).json({
          message: "Category updated",
          upsertedId: result.upsertedId,
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Failed to create/update category", error });
    }
  } else {
    // Handle unsupported HTTP methods
    res.setHeader("Allow", ["GET", "POST"]);
    res.status(405).json({ message: `Method ${req.method} not allowed` });
  }

  // Close the database connection
  setTimeout(() => {
    client.close();
  }, 1500);
}
