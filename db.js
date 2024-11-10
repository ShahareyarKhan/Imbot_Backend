// Import mongoose library for MongoDB interaction
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        // Connect to MongoDB using mongoose with a connection string
        await mongoose.connect("mongodb+srv://shahareyar2003:VaPPtk7FEqG5Un4I@cluster0.jvhep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("MongoDB connected"); // Log a success message if connected
    } catch (error) {
        console.log(`Error: ${error.message}`); // Log error message if connection fails
        process.exit(1); // Exit the process with failure code
    }
}

// Export the connectDB function to use it in other files
module.exports = connectDB;
