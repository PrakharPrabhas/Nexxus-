const mongoose = require("mongoose");

// =====================================
// EVENT SCHEMA
// =====================================

const eventSchema = new mongoose.Schema(
    {
        // Event name
        title: {
            type: String,
            required: true,
            trim: true
        },

        // Event date
        date: {
            type: String,
            required: true
        },

        // Event starting time
        time: {
            type: String,
            default: ""
        },

        // Event location
        venue: {
            type: String,
            default: "",
            trim: true
        },

        // Event status
        status: {
            type: String,
            enum: [
                "Upcoming",
                "Completed",
                "Cancelled"
            ],
            default: "Upcoming"
        },

        // Registration URL
        link: {
            type: String,
            default: ""
        },

        // Event description
        description: {
            type: String,
            default: ""
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
    "Event",
    eventSchema
);