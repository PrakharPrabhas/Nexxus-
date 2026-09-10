const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const Admin = require("../models/Admin");

// =====================================
// ADMIN LOGIN
// POST /api/auth/login
// =====================================

router.post("/login", async (req, res) => {

    try {

        const { email, password } = req.body;

        // Check input
        if (!email || !password) {

            return res.status(400).json({
                success: false,
                message: "Email and password are required"
            });
        }

        // Find admin
        const admin = await Admin.findOne({
            email: email.toLowerCase()
        });

        // Don't reveal whether email exists
        if (!admin) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Check status
        if (admin.status !== "Active") {

            return res.status(403).json({
                success: false,
                message: "Admin account is inactive"
            });
        }

        // Compare password
        const passwordMatch =
            await bcrypt.compare(
                password,
                admin.password
            );

        if (!passwordMatch) {

            return res.status(401).json({
                success: false,
                message: "Invalid email or password"
            });
        }

        // Create JWT
        const token = jwt.sign(
            {
                id: admin._id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "1d"
            }
        );

        res.json({
            success: true,
            message: "Login successful",

            token,

            admin: {
                id: admin._id,
                name: admin.name,
                email: admin.email
            }
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            success: false,
            message: "Login failed"
        });
    }
});


// =====================================
// NO SIGNUP ROUTE
// =====================================
//
// There is intentionally NO:
// POST /api/auth/register
//
// Admins are created only through:
// npm run setup-admins
// =====================================


module.exports = router;