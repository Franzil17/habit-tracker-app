const express = require("express");
const authMiddleware = require("../middleware/auth");
const Task = require("../models/Task");

const router = express.Router();

// Helper: Format Date to YYYY-MM-DD
function formatDate(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// Helper: Natural language date parser
function parseDateRangeFromQuery(query) {
    const q = query.toLowerCase();
    const now = new Date();

    let startDate = new Date(now);
    let endDate = new Date(now);
    let periodLabel = "the requested period";

    if (q.includes("today")) {
        periodLabel = "today (" + formatDate(now) + ")";
        return {
            startDateStr: formatDate(now),
            endDateStr: formatDate(now),
            periodLabel,
        };
    }

    if (q.includes("tomorrow")) {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        periodLabel = "tomorrow (" + formatDate(tomorrow) + ")";
        return {
            startDateStr: formatDate(tomorrow),
            endDateStr: formatDate(tomorrow),
            periodLabel,
        };
    }

    if (q.includes("this week") || q.includes("coming this week") || q.includes("upcoming week")) {
        // Start from current day (or Sunday/Monday of this week)
        const currentDayOfWeek = now.getDay(); // 0 = Sun, 1 = Mon ...
        const distToSunday = (7 - currentDayOfWeek) % 7;
        const endOfWeek = new Date(now);
        endOfWeek.setDate(now.getDate() + distToSunday);

        // Also check if user wants full week starting Sunday/Monday
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - currentDayOfWeek);

        periodLabel = `this week (${formatDate(startOfWeek)} to ${formatDate(endOfWeek)})`;
        return {
            startDateStr: formatDate(startOfWeek),
            endDateStr: formatDate(endOfWeek),
            periodLabel,
        };
    }

    if (q.includes("next week")) {
        const currentDayOfWeek = now.getDay();
        const daysUntilNextMon = (8 - currentDayOfWeek) % 7 || 7;
        const nextMon = new Date(now);
        nextMon.setDate(now.getDate() + daysUntilNextMon);
        const nextSun = new Date(nextMon);
        nextSun.setDate(nextMon.getDate() + 6);

        periodLabel = `next week (${formatDate(nextMon)} to ${formatDate(nextSun)})`;
        return {
            startDateStr: formatDate(nextMon),
            endDateStr: formatDate(nextSun),
            periodLabel,
        };
    }

    if (q.includes("this month")) {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        periodLabel = `this month (${formatDate(startOfMonth)} to ${formatDate(endOfMonth)})`;
        return {
            startDateStr: formatDate(startOfMonth),
            endDateStr: formatDate(endOfMonth),
            periodLabel,
        };
    }

    // Check for explicit YYYY-MM-DD pattern
    const isoDateMatch = q.match(/\b\d{4}-\d{2}-\d{2}\b/);
    if (isoDateMatch) {
        const targetDate = isoDateMatch[0];
        periodLabel = `on ${targetDate}`;
        return {
            startDateStr: targetDate,
            endDateStr: targetDate,
            periodLabel,
        };
    }

    // Default fallback: upcoming tasks from today onwards (next 30 days)
    const futureLimit = new Date(now);
    futureLimit.setDate(now.getDate() + 30);
    periodLabel = `upcoming tasks (${formatDate(now)} to ${formatDate(futureLimit)})`;
    return {
        startDateStr: formatDate(now),
        endDateStr: formatDate(futureLimit),
        periodLabel,
    };
}

// ─── POST /api/chatbot ────────────────────────────────────────────────────────
router.post("/", authMiddleware, async (req, res) => {
    const { query } = req.body;

    if (!query || !query.trim()) {
        return res.status(400).json({ msg: "Please provide a query string." });
    }

    try {
        const { startDateStr, endDateStr, periodLabel } = parseDateRangeFromQuery(query);

        const tasks = await Task.find({
            userId: req.user.id,
            date: { $gte: startDateStr, $lte: endDateStr },
        }).sort({ date: 1, createdAt: 1 });

        let responseText = "";

        if (tasks.length === 0) {
            responseText = `You have 0 tasks scheduled for ${periodLabel}.`;
        } else {
            const countText = tasks.length === 1 ? "1 task" : `${tasks.length} tasks`;
            responseText = `You have ${countText} for ${periodLabel}:\n` +
                tasks.map((t, idx) => `${idx + 1}. [${t.date}] ${t.task}`).join("\n");
        }

        res.json({
            query,
            periodLabel,
            startDate: startDateStr,
            endDate: endDateStr,
            tasks,
            response: responseText,
        });
    } catch (err) {
        console.error("Chatbot query error:", err.message);
        res.status(500).send("Server error processing chatbot query");
    }
});

module.exports = router;
