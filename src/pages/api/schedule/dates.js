import { ObjectId } from "mongodb";
import connectDB from "@/lib/schedule.db";

export default async function handler(req, res) {
  const client = await connectDB();
  const db = client.db("Data");
  const collection = db.collection("Calendarv2");

  if (req.method == "GET") {
    const { startDate, endDate, ...rest } = req.body;

    if (startDate && endDate) {
      const dates = await collection
        .find({
          startDate: {
            $gte: startDate,
            $lte: endDate,
          },
        })
        .toArray();
      res.status(200).json(dates);
    }
    else {
      res.status(200).json([]);
      
    }
    
  } else if (req.method == "POST") {
    const dates = req.body;
    
  }



  // Close the database connection
  setTimeout(() => {
    client.close();
  }, 1500);
}
