const express = require("express");
const router = express.Router();

const Statistic = require("../models/Statistic");
const protectMutations = require("../middleware/protectMutations");
const { handleRouteError } = require("../utils/routeError");

router.use(protectMutations);

function pickStatistic(body = {}) {
    const data = {};

    if (body.label !== undefined) data.label = body.label;
    if (body.suffix !== undefined) data.suffix = body.suffix;
    if (body.status !== undefined) data.status = body.status;

    if (body.value !== undefined && body.value !== "") {
        data.value = Number(body.value);

        if (Number.isNaN(data.value)) {
            const error = new Error("Value must be a number");
            error.name = "ValidationError";
            throw error;
        }
    }

    return data;
}

router.get("/", async (req, res) => {
    try {
        const statistics = await Statistic.find().sort({ createdAt: 1 });

        res.json({
            success: true,
            count: statistics.length,
            data: statistics
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch statistics"
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const statistic = await Statistic.findById(req.params.id);

        if (!statistic) {
            return res.status(404).json({
                success: false,
                message: "Statistic not found"
            });
        }

        res.json({
            success: true,
            data: statistic
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch statistic"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const statistic = await Statistic.create(pickStatistic(req.body));

        res.status(201).json({
            success: true,
            message: "Statistic created successfully",
            data: statistic
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to create statistic"
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const statistic = await Statistic.findByIdAndUpdate(
            req.params.id,
            pickStatistic(req.body),
            {
                new: true,
                runValidators: true
            }
        );

        if (!statistic) {
            return res.status(404).json({
                success: false,
                message: "Statistic not found"
            });
        }

        res.json({
            success: true,
            message: "Statistic updated successfully",
            data: statistic
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to update statistic"
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const statistic = await Statistic.findByIdAndDelete(req.params.id);

        if (!statistic) {
            return res.status(404).json({
                success: false,
                message: "Statistic not found"
            });
        }

        res.json({
            success: true,
            message: "Statistic deleted successfully"
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to delete statistic"
        });
    }
});

module.exports = router;
