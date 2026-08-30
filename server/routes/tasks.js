const express = require("express");
const authMiddleware = require("../middleware/auth");
const Task = require("../models/Task");

const router = express.Router();

// ─── GET /api/tasks ───────────────────────────────────────────────────────────
// Fetch all tasks for the logged in user
router.get("/", authMiddleware, async (req, res) => {
    try {
        const tasks = await Task.find({ userId: req.user.id }).sort({ date: 1, createdAt: 1 });
        res.json({ tasks });
    } catch (err) {
        console.error("Fetch tasks error:", err.message);
        res.status(500).send("Server error");
    }
});

// ─── POST /api/tasks ──────────────────────────────────────────────────────────
// Create/save a new task: { date, task }
router.post("/", authMiddleware, async (req, res) => {
    const { date, task } = req.body;

    if (!date || !task || !task.trim()) {
        return res.status(400).json({ msg: "Please provide a valid date and task content" });
    }

    try {
        const newTask = new Task({
            userId: req.user.id,
            date: date.trim(),
            task: task.trim(),
        });

        const savedTask = await newTask.save();
        res.status(201).json({ msg: "Task saved successfully", task: savedTask });
    } catch (err) {
        console.error("Save task error:", err.message);
        res.status(500).send("Server error");
    }
});

// ─── DELETE /api/tasks/:id ────────────────────────────────────────────────────
// Delete a specific task
router.delete("/:id", authMiddleware, async (req, res) => {
    try {
        const task = await Task.findOne({ _id: req.params.id, userId: req.user.id });
        if (!task) {
            return res.status(404).json({ msg: "Task not found or unauthorized" });
        }

        await Task.deleteOne({ _id: req.params.id });
        res.json({ msg: "Task deleted successfully" });
    } catch (err) {
        console.error("Delete task error:", err.message);
        res.status(500).send("Server error");
    }
});

module.exports = router;
