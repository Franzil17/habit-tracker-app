const express = require("express");
const authMiddleware = require("../middleware/auth");
const User = require("../models/User");
const HabitLog = require("../models/HabitLog");

const router = express.Router();

// ─── GET /api/habits/completions ──────────────────────────────────────────────
router.get("/completions", authMiddleware, async (req, res) => {
    try {
        const logs = await HabitLog.find({ userId: req.user.id });
        const completions = {};
        logs.forEach(log => {
            if (log.status === "completed") {
                const key = `${log.habitId}_${log.date}`;
                completions[key] = true;
            }
        });
        res.json({ completions });
    } catch (err) {
        console.error("Fetch completions error:", err.message);
        res.status(500).send("Server error");
    }
});

// ─── POST /api/habits/toggle ──────────────────────────────────────────────────
router.post("/toggle", authMiddleware, async (req, res) => {
    const { habitId, habitName, date, status } = req.body;

    if (!habitId || !habitName || !date || !status) {
        return res.status(400).json({ msg: "Please provide habitId, habitName, date, and status" });
    }

    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ msg: "User not found" });

        const userSignupDate = user.signupDate || (user.createdAt ? user.createdAt.toISOString().split("T")[0] : "2000-01-01");

        // Restrict editing prior to user's signupDate
        if (date < userSignupDate) {
            return res.status(400).json({
                msg: `Cannot edit habit completion prior to signup date (${userSignupDate})`,
            });
        }

        if (status === "completed") {
            const updated = await HabitLog.findOneAndUpdate(
                { userId: req.user.id, habitId, date },
                { habitName, status: "completed" },
                { upsert: true, new: true }
            );
            return res.json({ msg: "Habit completed successfully", log: updated });
        } else {
            await HabitLog.deleteOne({ userId: req.user.id, habitId, date });
            return res.json({ msg: "Habit status cleared successfully" });
        }
    } catch (err) {
        console.error("Toggle habit error:", err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
