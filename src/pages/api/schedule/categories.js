import { ObjectId } from "mongodb";
import connectDB from "@/lib/schedule.db";

export default async function handler(req, res) {
  const client = await connectDB();
  const db = client.db("Data");
  const collection = db.collection("Categories");

  try {
    if (req.method === "GET") {
      // Fetch all categories
      try {
        const categories = await collection.find({}).toArray();
        res.status(200).json(categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        res.status(500).json({ message: "Failed to fetch categories", error: error.toString() });
      }
    } else if (req.method === "POST") {
      const categoryData = { ...req.body };

      if (categoryData.action === "add") {
        // Create a new category
        const { name, color } = categoryData.content || categoryData;
        const result = await collection.insertOne({ name, color });
        res.status(201).json({
          message: "Category created",
          upsertedId: result.insertedId,
        });
      } else if (categoryData.action === "update") {
        // Update an existing category
        const { _id, name, color } = categoryData.content || categoryData;
        const result = await collection.updateOne(
          { _id: new ObjectId(_id) },
          { $set: { name, color } }
        );
        res.status(200).json({
          message: "Category updated",
          modifiedCount: result.modifiedCount
        });
      } else if (categoryData.action === "delete") {
        // Delete a category
        const { _id } = categoryData.content || categoryData;
        await collection.deleteOne({ _id: new ObjectId(_id) });
        res.status(200).json({ message: "Category deleted" });
      } else {
        // Legacy support for original API format
        const { _id, name, color } = categoryData;

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
      }
    } else if (req.method === "DELETE") {
      // Extract category ID from URL if using path-based deletion
      const categoryId = req.query.id || (req.url.split('/').pop());

      if (!categoryId) {
        return res.status(400).json({ message: "Category ID is required" });
      }

      await collection.deleteOne({ _id: new ObjectId(categoryId) });
      res.status(200).json({ message: "Category deleted" });
    } else {
      // Handle unsupported HTTP methods
      res.setHeader("Allow", ["GET", "POST", "DELETE"]);
      res.status(405).json({ message: `Method ${req.method} not allowed` });
    }
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ message: "Server error", error: error.toString() });
  } finally {
    // Close the database connection after a short delay
    setTimeout(() => {
      client.close();
    }, 1500);
  }
}
