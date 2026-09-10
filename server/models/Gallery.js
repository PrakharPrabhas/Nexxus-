const mongoose = require("mongoose");

// =====================================
// GALLERY SCHEMA
// =====================================

const gallerySchema = new mongoose.Schema(
    {

        // Image title
        title: {
            type: String,
            required: true,
            trim: true
        },

        // Image URL
        imageUrl: {
            type: String,
            required: true,
            trim: true
        },

        // Optional event/category
        category: {
            type: String,
            default: "General",
            trim: true
        },

        // Short description
        description: {
            type: String,
            default: ""
        },

        // Whether image is visible publicly
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
    "Gallery",
    gallerySchema
);