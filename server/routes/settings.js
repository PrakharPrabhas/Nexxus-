const express = require("express");
const router = express.Router();

const Setting = require("../models/Setting");
const protectMutations = require("../middleware/protectMutations");
const { handleRouteError } = require("../utils/routeError");

router.use(protectMutations);

function pickSettings(body = {}) {
    const data = {};

    [
        "siteName",
        "tagline",
        "about",
        "email",
        "phone",
        "instagram",
        "linkedin",
        "github",
        "logo"
    ].forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });

    if (body.about === undefined && body.description !== undefined) {
        data.about = body.description;
    }

    if (body.maintenanceMode !== undefined) {
        const value = body.maintenanceMode;
        data.maintenanceMode =
            value === true ||
            value === "true" ||
            value === "on" ||
            value === "1";
    }

    return data;
}

router.get("/", async (req, res) => {
    try {
        let settings = await Setting.findOne();

        if (!settings) {
            settings = await Setting.create({
                siteName: "NEXUS"
            });
        }

        res.json({
            success: true,
            data: settings
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch settings"
        });
    }
});

router.put("/", async (req, res) => {
    try {
        const update = pickSettings(req.body);
        let settings = await Setting.findOne();

        if (!settings) {
            settings = await Setting.create(update);
        } else {
            settings = await Setting.findByIdAndUpdate(
                settings._id,
                update,
                {
                    new: true,
                    runValidators: true
                }
            );
        }

        res.json({
            success: true,
            message: "Settings updated successfully",
            data: settings
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to update settings"
        });
    }
});

module.exports = router;
