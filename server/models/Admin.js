const mongoose = require("mongoose");

// =====================================
// ADMIN SCHEMA
// =====================================

const adminSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        // Password is stored as a bcrypt hash
        password: {
            type: String,
            required: true
        },

        status: {
            type: String,
            enum: ["Active", "Inactive"],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "Admin",
    adminSchema
);