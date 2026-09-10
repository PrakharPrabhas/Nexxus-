const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const readline = require("readline");

require("dotenv").config();

const Admin = require("../models/Admin");

// =====================================
// TERMINAL INPUT
// =====================================

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function question(text) {

    return new Promise(resolve => {

        rl.question(text, answer => {
            resolve(answer.trim());
        });

    });
}

// =====================================
// CREATE TWO ADMINS
// =====================================

async function setupAdmins() {

    try {

        console.log("\n=================================");
        console.log(" NEXUS ADMIN SETUP");
        console.log("=================================\n");

        // Connect MongoDB
        await mongoose.connect(
            process.env.MONGODB_URI
        );

        console.log(
            "MongoDB connected successfully.\n"
        );

        // Check existing admins
        const existingAdmins =
            await Admin.countDocuments();

        if (existingAdmins >= 2) {

            console.log(
                "Maximum of 2 admins already exists."
            );

            console.log(
                "No additional admin can be created."
            );

            await mongoose.disconnect();
            rl.close();

            return;
        }

        if (existingAdmins > 0) {

            console.log(
                `There is already ${existingAdmins} admin account.`
            );

            console.log(
                "This setup will create only the remaining account.\n"
            );
        }

        const remaining =
            2 - existingAdmins;

        console.log(
            `You can create ${remaining} more admin account(s).\n`
        );

        for (let i = existingAdmins + 1; i <= 2; i++) {

            console.log(
                `---------- ADMIN ${i} ----------`
            );

            const name = await question(
                "Name: "
            );

            const email = await question(
                "Email: "
            );

            const password = await question(
                "Password: "
            );

            if (!name || !email || !password) {

                console.log(
                    "All fields are required."
                );

                i--;
                continue;
            }

            // Check duplicate email
            const existing =
                await Admin.findOne({
                    email: email.toLowerCase()
                });

            if (existing) {

                console.log(
                    "An admin with this email already exists."
                );

                i--;
                continue;
            }

            // Hash password
            const hashedPassword =
                await bcrypt.hash(
                    password,
                    12
                );

            await Admin.create({
                name,
                email: email.toLowerCase(),
                password: hashedPassword,
                status: "Active"
            });

            console.log(
                `\nAdmin ${i} created successfully. ✅\n`
            );
        }

        console.log(
            "================================="
        );

        console.log(
            "Admin setup completed."
        );

        console.log(
            "Maximum admin accounts: 2"
        );

        console.log(
            "=================================\n"
        );

        await mongoose.disconnect();
        rl.close();

    } catch (error) {

        console.error(
            "\nAdmin setup failed ❌"
        );

        console.error(error.message);

        await mongoose.disconnect();
        rl.close();

        process.exit(1);
    }
}

setupAdmins();