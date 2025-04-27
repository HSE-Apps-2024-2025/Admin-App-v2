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
        }
        else if (req.query.getColoredDates) { 
            try {
                // Get all events
                const allEvents = await collection.find({}).toArray();
                
                // Create a map to group events by date and collect unique category IDs
                const dateMap = new Map();
                
                allEvents.forEach(event => {
                    if (event.content && event.content.date) {
                        // Extract just the date part (YYYY-MM-DD) from ISO string
                        const dateOnly = new Date(event.content.date).toISOString().split('T')[0];
                        
                        if (!dateMap.has(dateOnly)) {
                            dateMap.set(dateOnly, new Set());
                        }
                        
                        // Add categoryId to the set for this date (if it exists)
                        if (event.content.categoryId) {
                            dateMap.get(dateOnly).add(event.content.categoryId);
                        }
                    }
                });
                
                // Convert the map to the required output format
                const coloredDates = Array.from(dateMap).map(([date, categoryIdsSet]) => ({
                    date: date,
                    categories: Array.from(categoryIdsSet)
                }));
                
                res.status(200).json(coloredDates);
            } catch (error) {
                console.error("Error getting colored dates:", error);
                res.status(500).json({ message: "Error retrieving colored dates" });
            }
        }
        else {
            // Original behavior - return all events if no date specified
            const events = await collection.find({}).toArray();
            res.status(200).json(events);
        }
    }
    // If the request method is "POST", create a new event or update an existing event
    else if (req.method == "POST") {
        const event = {...req.body};
        
        if (event.action == "add") {
            const eventContent = {...event.content};
            // Remove _id if it exists to avoid the immutability error
            delete eventContent._id;
            
            try {
                const result = await collection.insertOne({ 
                    content: eventContent 
                });
                res.status(200).json({ message: "Event created", _id: result.insertedId });
            } catch (error) {
                console.error("Error adding event:", error);
                res.status(500).json({ message: "Failed to create event" });
            }
        }    
        else if (event.action == "update") {
            try {
                // Create a copy of the content to modify
                const contentToUpdate = {...event.content};
                const eventId = contentToUpdate._id;
                
                // Remove _id field from the content object to avoid immutability error
                delete contentToUpdate._id;
                
                await collection.updateOne(
                    { _id: new ObjectId(eventId) }, 
                    { $set: { content: contentToUpdate } }
                );
                res.status(200).json({ message: "Event updated" });
            } catch (error) {
                console.error("Error updating event:", error);
                res.status(500).json({ message: "Failed to update event" });
            }
        }
        else if (event.action == "delete") {
            try {
                await collection.deleteOne({ _id: new ObjectId(event.content._id) });
                res.status(200).json({ message: "Event deleted" });
            } catch (error) {
                console.error("Error deleting event:", error);
                res.status(500).json({ message: "Failed to delete event" });
            }
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