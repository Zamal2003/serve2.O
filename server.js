const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
require('dotenv').config();

app.use(
  cors({
    origin: ["https://admin-form-beige.vercel.app/", "https://observation-form.vercel.app/", "*"], // Open to all origins (for dev). Change this to frontend URL in production.
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials:true
  })
);

// const Observation = require('./models/Observation');
const authRoutes = require("./routes/authRoutes");
const dashBoard= require("./routes/dashBoard")
const Observation= require("./routes/observations")
const app = express();
// const PORT = 5000;
const PORT = process.env.PORT || 5000;


app.use(express.json()); // Middleware to parse JSON

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api/admin", authRoutes);
app.use("/api/dashboard", dashBoard);
app.use("/api/form", Observation)

// MongoDB connection
const mongoURI=process.env.MONGO_URI;
mongoose.connect(mongoURI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));



// Routes
app.get("/", (req, res) => {
  res.send("Hello, MongoDB is connected!");
});

// POST API for Observations
// app.post("/api/observations", async (req, res) => {
//     try {
//       const newObservation = new Observation(req.body);
//       await newObservation.save();
//       res.status(201).json({ message: "Observation Created", observation: newObservation });
//     } catch (error) {
//       res.status(500).json({ error: error.message });
//     }
//   });

// // get observation
// app.get("/api/observations", async (req, res) => {
//     try {
//         const observations = await Observation.find();
//         res.status(200).json({ observations });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });


// // Update Observation
// app.put("/api/observations/:observationId", async (req, res) => {
//     try {
//         const { observationId } = req.params; // Get observation ID from URL
//         const updateData = req.body; // Get updated data from request body

//         // Find and update the observation
//         const updatedObservation = await Observation.findByIdAndUpdate(
//             observationId, // ID of the observation to update
//             updateData,    // New data to update
//             { new: true }  // Return the updated document
//         );

//         if (!updatedObservation) {
//             return res.status(404).json({ message: "Observation not found" });
//         }

//         res.status(200).json({ message: "Observation updated", observation: updatedObservation });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// // Delete Observation
// app.delete("/api/observations/:observationId", async (req, res) => {
//     try {
//         const { observationId } = req.params; // Get observation ID from URL

//         // Find and delete the observation
//         const deletedObservation = await Observation.findByIdAndDelete(observationId);

//         if (!deletedObservation) {
//             return res.status(404).json({ message: "Observation not found" });
//         }

//         res.status(200).json({ message: "Observation deleted", observation: deletedObservation });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// });

// Endpoint to get total forms filled
// app.get('/api/total-forms', async (req, res) => {
//     console.log('Received request for /api/total-forms'); // Log the request
//     try {
//         const totalForms = await   Observation.countDocuments();
//         console.log('Total forms:', totalForms); // Log the result
//         res.json({ totalForms });
//     } catch (error) {
//         console.error('Error:', error); // Log the error
//         res.status(500).json({ error: 'Failed to fetch total forms' });
//     }
// });

// Endpoint to get today's forms filled
// app.get('/api/today-forms', async (req, res) => {
//     console.log('Received request for /api/today-forms'); // Log the request
//     try {
//         // Get today's date at midnight
//         const today = new Date();
//         today.setHours(0, 0, 0, 0); // Set time to 00:00:00

//         // Count forms filled today
//         const todayForms = await Observation.countDocuments({
//             date: { $gte: today } // Filter forms with date >= today's midnight
//         });

//         console.log('Today\'s forms:', todayForms); // Log the result
//         res.json({ todayForms });
//     } catch (error) {
//         console.error('Error:', error); // Log the error
//         res.status(500).json({ error: 'Failed to fetch today\'s forms' });
//     }
// });

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
