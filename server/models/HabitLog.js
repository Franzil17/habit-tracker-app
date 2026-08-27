const mongoose = require("mongoose");

const HabitLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    habitId: { type: String, required: true },
    habitName: { type: String, required: true },
    date: { type: String, required: true }, // Format: YYYY-MM-DD
    status: { type: String, enum: ["completed", "missed"], required: true },
}, { timestamps: true });

// Compound unique index so each user can have at most one log per habit per date
HabitLogSchema.index({ userId: 1, habitId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("HabitLog", HabitLogSchema);
