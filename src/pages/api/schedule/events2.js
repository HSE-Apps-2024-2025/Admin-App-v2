import { ObjectId } from "mongodb";

// Import the connectDB function from the custom database connection library
import connectDB from "@/lib/schedule.db";

// Define the handler function for the API route
export default async function handler(req, res) {
    // Connect to the database using the connectDB function
    const client = await connectDB();
    // Access the "Data" database
    const db = client.db("Data");
    
    // Access the "Events" collection within the "Data" database
    const collection = db.collection("V2Events");
    
    // If the request method is "GET", retrieve all events
    if (req.method == "GET") {
        const currentDate = new Date();
        let startDate, endDate;

        // Check if the request body contains a date range
        if (req.body.startDate && req.body.endDate) {
            startDate = new Date(req.body.startDate);
            endDate = new Date(req.body.endDate);
        } else {
            // Default to next month if no date range provided
            startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
            endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
        }

        const events = await collection.find({
            startDate: {
                $gte: startDate,
                $lte: endDate
            }
        }).toArray();

        res.status(200).json(events);

    }
    
    // If the request method is "POST", create a new event or update an existing event
    else if (req.method == "POST") {
        const event = {...req.body};
        delete event._id;
        const resp = await collection.updateOne({ _id: new ObjectId(req.body._id) }, { $set: event }, { upsert: true });
        res.status(200).json({ message: "Event created", _id: resp.insertedId });
    }

    // Close the database connection after a short delay (1500ms)
    setTimeout(() => {
        client.close();
    }, 1500);
}