const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://shahareyar2003:VaPPtk7FEqG5Un4I@cluster0.jvhep.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("MongoDB connected");
    } catch (error) {
        console.log(`Error: ${error.message}`);
        process.exit(1);
    }
}

module.exports = connectDB;