const mongoose = require("mongoose");

// =====================================
// PROJECT SCHEMA
// =====================================

const projectSchema = new mongoose.Schema(
    {

        // Project name
        title: {
            type: String,
            required: true,
            trim: true
        },

        // Team responsible for the project
        team: {
            type: String,
            enum: [
                "Tech",
                "Management",
                "PR",
                "Creative",
                "All Teams"
            ],
            default: "Tech"
        },

        // Current project status
        status: {
            type: String,
            enum: [
                "Planning",
                "In Progress",
                "Completed"
            ],
            default: "Planning"
        },

        // Project description
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
    "Project",
    projectSchema
);