const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    signupDate: {
        type: String,
        required: true,
        default: () => new Date().toISOString().split("T")[0],
    },
}, { timestamps: true });

module.exports = mongoose.model("User", UserSchema);