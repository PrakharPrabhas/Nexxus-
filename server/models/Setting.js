const mongoose = require("mongoose");

// =====================================
// SETTINGS SCHEMA
// =====================================

const settingSchema = new mongoose.Schema(
    {
        // Website / club name
        siteName: {
            type: String,
            default: "NEXUS"
        },

        // Main tagline
        tagline: {
            type: String,
            default: ""
        },

        // About section
        about: {
            type: String,
            default: ""
        },

        // Contact email
        email: {
            type: String,
            default: ""
        },

        // Contact phone
        phone: {
            type: String,
            default: ""
        },

        // Social media links
        instagram: {
            type: String,
            default: ""
        },

        linkedin: {
            type: String,
            default: ""
        },

        github: {
            type: String,
            default: ""
        },

        // Logo URL
        logo: {
            type: String,
            default: ""
        },

        // Website visibility
        maintenanceMode: {
            type: Boolean,
            default: false
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
    "Setting",
    settingSchema
);