const express = require('express');
const router = express.Router();
const Observation = require('../models/Observation');

// Get all observations with search functionality (newest first)
router.get('/observations', async (req, res) => {
    try {
        const { search } = req.query;
        
        // Build search query
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { observation: { $regex: search, $options: 'i' } },
                    { location: { $regex: search, $options: 'i' } },
                    { category: { $regex: search, $options: 'i' } },
                    { responsiblePerson: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Get observations with search (sorted by date descending)
        const observations = await Observation.find(query)
            .sort({ date: -1, createdAt: -1 })  // Sort by date first, then creation time
            .exec();

        res.status(200).json({ observations });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Rest of your CRUD operations remain exactly the same
router.post("/observations", async (req, res) => {
    try {
        const newObservation = new Observation(req.body);
        await newObservation.save();
        res.status(201).json({ 
            message: "Observation Created", 
            observation: newObservation 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.put("/observations/:observationId", async (req, res) => {
    try {
        const { observationId } = req.params;
        const updatedObservation = await Observation.findByIdAndUpdate(
            observationId,
            req.body,
            { new: true }
        );
        
        if (!updatedObservation) {
            return res.status(404).json({ message: "Observation not found" });
        }
        
        res.status(200).json({ 
            message: "Observation updated", 
            observation: updatedObservation 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete("/observations/:observationId", async (req, res) => {
    try {
        const { observationId } = req.params;
        const deletedObservation = await Observation.findByIdAndDelete(observationId);
        
        if (!deletedObservation) {
            return res.status(404).json({ message: "Observation not found" });
        }
        
        res.status(200).json({ 
            message: "Observation deleted", 
            observation: deletedObservation 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;