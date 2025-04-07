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
        // Check if date query parameter exists
        if (req.query.date) {
            // Get the date parameter from the request query
            const dateParam = req.query.date;
            // Return events for the specified date
            // This handles the date portion comparison when dates in MongoDB are ISO format
            const startOfDay = new Date(dateParam);
            startOfDay.setUTCHours(0, 0, 0, 0);
            
            const endOfDay = new Date(dateParam);
            endOfDay.setUTCHours(23, 59, 59, 999);
            
            console.log(startOfDay)
            console.log(endOfDay)
            const events = await collection.find({
                "content.date": {
                    $gte: startOfDay.toISOString(),
                    $lte: endOfDay.toISOString()
                }
            }).toArray();
            
            res.status(200).json(events);
        } else {
            // Original behavior - return all events if no date specified
            const events = await collection.find({}).toArray();
            res.status(200).json(events);
        }
    }
    // If the request method is "POST", create a new event or update an existing event
    else if (req.method == "POST") {
        const event = {...req.body};
        
        if (event.action == "add"){
            const resp = await collection.updateOne({ _id: new ObjectId(req.body._id) }, { $set: event }, { upsert: true });
            res.status(200).json({ message: "Event created", _id: resp.insertedId });
        }    
        else if (event.action == "update"){
            await collection.updateOne({ _id: new ObjectId(event._id) }, { $set: event.content});
            res.status(200).json({ message: "Event updated" });
        }
        else if (event.action == "delete"){
            await collection.deleteOne({ _id: new ObjectId(event._id) });
            res.status(200).json({ message: "Event deleted" });
        }
        else {
            res.status(400).json({ message: "Invalid action" });
        }
    }

    // Close the database connection after a short delay (1500ms)
    setTimeout(() => {
        client.close();
    }, 1500);
}