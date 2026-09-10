const mongoose = require("mongoose");

// =====================================
// STATISTIC SCHEMA
// =====================================

const statisticSchema = new mongoose.Schema(
    {
        // Name shown on the website
        label: {
            type: String,
            required: true,
            trim: true
        },

        // Numeric value
        value: {
            type: Number,
            required: true,
            default: 0
        },

        // Optional suffix such as +, %, etc.
        suffix: {
            type: String,
            default: ""
        },

        // Whether the statistic is visible
        status: {
            type: String,
            enum: [
                "Active",
                "Inactive"
            ],
            default: "Active"
        }
    },
    {
        timestamps: true
    }
);

// =====================================
// EXPORT MODEL
// =====================================

module.exports = mongoose.model(
    "Statistic",
    statisticSchema
);