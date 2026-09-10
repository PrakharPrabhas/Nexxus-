const mongoose = require("mongoose");

// =====================================
// MEMBER SCHEMA
// =====================================

const memberSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        role: {
            type: String,
            required: true,
            enum: [
                "President",
                "Vice-President",
                "Lead",
                "Member"
            ],
            trim: true
        },

        group: {
            type: String,
            required: true,
            enum: [
                "Tech",
                "Management",
                "PR",
                "Creative",
                "Student Coordinator"
            ]
        },

        email: {
            type: String,
            trim: true,
            lowercase: true
        },

        photo: {
            type: String,
            default: ""
        },

        description: {
            type: String,
            default: ""
        },

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
    "Member",
    memberSchema
);