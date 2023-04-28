// Import the ObjectId type from the MongoDB library
import { ObjectId } from "mongodb";

// Import the connectDB function from the custom database connection library
import connectDB from "@/lib/schedule.db";

// Import the referer checking function from the helper library
import checkReferer from "@/helpers/checkreferer";

// Define the handler function for the API route
export default async function handler(req, res) {
  // If the referer is not allowed, return a 403 error
  if (!checkReferer(req)) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  // Connect to the database using the connectDB function
  const client = await connectDB();
  // Access the "Data" database
  const db = client.db("Data");
  // Access the "Special Schedules" collection within the "Data" database
  const collection = db.collection("Special Schedules");

  // If the request method is "GET", retrieve all special schedules
  if (req.method == "GET") {
    const specialSchedules = await collection.find().toArray();
    res.status(200).json(specialSchedules);
  }
  // If the request method is "POST", create a new special schedule
  else if (req.method == "POST") {
    const newSpecialSchedule = req.body;
    const resp = await collection.insertOne(newSpecialSchedule);
    res
      .status(200)
      .json({ _id: resp.insertedId, message: "Special Schedule added" });
  }
  // If the request method is "PATCH", update the specified special schedule
  else if (req.method == "PATCH") {
    const newSpecialSchedule = req.body;
    await collection.updateOne(
      { _id: new ObjectId(newSpecialSchedule._id) },
      {
        $set: {
          data: newSpecialSchedule.data,
          Name: newSpecialSchedule.Name,
          SpecialType: newSpecialSchedule.SpecialType,
        },
      }
    );
    res.status(200).json({ message: "Special Schedule updated" });
  }
  // If the request method is "DELETE", delete the specified special schedule
  else if (req.method == "DELETE") {
    const newSpecialSchedule = req.body;
    await collection.deleteOne({ _id: new ObjectId(newSpecialSchedule._id) });
    res.status(200).json({ message: "Special Schedule deleted" });
  }

  // Close the database connection after a short delay (1500ms)
  setTimeout(() => {
    client.close();
  }, 1500);
}
