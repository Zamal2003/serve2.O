const express = require('express');
const router = express.Router();
const Observation = require('../models/Observation');
const { isValidDate } = require('../utils/validators'); // Optional date validator

// Enhanced Forms by Date endpoint
router.get('/forms-by-date', async (req, res) => {
    try {
        const { date, startDate, endDate } = req.query;
        
        // Handle specific date request
        if (date) {
            if (!isValidDate(date)) {
                return res.status(400).json({ error: 'Invalid date format. Use YYYY-MM-DD' });
            }

            const start = new Date(date);
            const end = new Date(start);
            end.setDate(end.getDate() + 1);

            const [forms, stats] = await Promise.all([
                Observation.find({
                    date: { $gte: start, $lt: end }
                })
                .sort({ createdAt: -1 })
                .limit(50)
                .lean(),
                
                Observation.aggregate([
                    {
                        $match: {
                            date: { $gte: start, $lt: end }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            count: { $sum: 1 },
                            firstSubmission: { $min: "$createdAt" },
                            lastSubmission: { $max: "$createdAt" }
                        }
                    }
                ])
            ]);

            const result = {
                date: date,
                count: stats[0]?.count || 0,
                firstSubmission: stats[0]?.firstSubmission || null,
                lastSubmission: stats[0]?.lastSubmission || null,
                forms: forms.map(form => ({
                    id: form._id,
                    userName: form.userName || 'Anonymous',
                    createdAt: form.createdAt,
                    // Add other relevant fields
                }))
            };

            return res.json(result);
        }

        // Handle date range request
        if (startDate || endDate) {
            const filter = {};
            if (startDate && isValidDate(startDate)) {
                filter.$gte = new Date(startDate);
            }
            if (endDate && isValidDate(endDate)) {
                filter.$lte = new Date(endDate);
            }

            const formsByDate = await Observation.aggregate([
                {
                    $match: Object.keys(filter).length ? { date: filter } : {}
                },
                {
                    $group: {
                        _id: {
                            $dateToString: { format: "%Y-%m-%d", date: "$date" }
                        },
                        count: { $sum: 1 },
                        firstSubmission: { $min: "$createdAt" },
                        lastSubmission: { $max: "$createdAt" }
                    }
                },
                {
                    $project: {
                        date: "$_id",
                        count: 1,
                        firstSubmission: 1,
                        lastSubmission: 1,
                        _id: 0
                    }
                },
                { $sort: { date: 1 } }
            ]);

            return res.json(formsByDate || []);
        }

        // Default: last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const formsByDate = await Observation.aggregate([
            {
                $match: {
                    date: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$date" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $project: {
                    date: "$_id",
                    count: 1,
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        res.json(formsByDate || []);
    } catch (error) {
        console.error('Error fetching forms by date:', error);
        res.status(500).json({ error: 'Failed to fetch forms by date' });
    }
});

// Enhanced Total Forms Count with filters
router.get('/total-forms', async (req, res) => {
    try {
        const { startDate, endDate } = req.query;
        const filter = {};
        
        if (startDate && isValidDate(startDate)) {
            filter.$gte = new Date(startDate);
        }
        if (endDate && isValidDate(endDate)) {
            filter.$lte = new Date(endDate);
        }

        const totalForms = await Observation.countDocuments(
            Object.keys(filter).length ? { date: filter } : {}
        );

        res.json({ 
            totalForms,
            ...(Object.keys(filter).length && { dateRange: { startDate, endDate } })
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to fetch total forms' });
    }
});

// Enhanced Today's Forms with hourly breakdown
// Enhanced Today's Forms endpoint with better error handling
router.get('/today-forms', async (req, res) => {
    try {
        // Get current date in UTC and set to beginning of day
        const now = new Date();
        const todayUTC = new Date(Date.UTC(
            now.getUTCFullYear(), 
            now.getUTCMonth(), 
            now.getUTCDate(),
            0, 0, 0, 0
        ));
        
        const tomorrowUTC = new Date(todayUTC);
        tomorrowUTC.setUTCDate(tomorrowUTC.getUTCDate() + 1);

        // Query using both date and createdAt for reliability
        const query = {
            $or: [
                { date: { $gte: todayUTC, $lt: tomorrowUTC } },
                { 
                    $and: [
                        { date: { $exists: false } },
                        { createdAt: { $gte: todayUTC, $lt: tomorrowUTC } }
                    ]
                }
            ]
        };

        const [todayForms, hourlyData] = await Promise.all([
            Observation.countDocuments(query),
            
            Observation.aggregate([
                {
                    $match: query
                },
                {
                    $group: {
                        _id: {
                            $hour: { 
                                $ifNull: ["$date", "$createdAt"]
                            }
                        },
                        count: { $sum: 1 }
                    }
                },
                {
                    $project: {
                        hour: "$_id",
                        count: 1,
                        _id: 0
                    }
                },
                { $sort: { hour: 1 } }
            ])
        ]);

        // Format hourly data to include all 24 hours
        const formattedHourlyData = Array.from({ length: 24 }, (_, i) => {
            const hourData = hourlyData.find(h => h.hour === i);
            return {
                hour: i,
                count: hourData ? hourData.count : 0
            };
        });

        res.json({ 
            success: true,
            date: todayUTC.toISOString(),
            todayForms,
            hourlyData: formattedHourlyData
        });
    } catch (error) {
        console.error('Error fetching today\'s forms:', error);
        res.status(500).json({ 
            success: false,
            error: 'Failed to fetch today\'s forms',
            details: error.message 
        });
    }
});
module.exports = router;