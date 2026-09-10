const express = require("express");
const router = express.Router();

const Event = require("../models/Event");
const protectMutations = require("../middleware/protectMutations");
const { handleRouteError } = require("../utils/routeError");

router.use(protectMutations);

function pickEvent(body = {}) {
    const data = {};

    [
        "title",
        "date",
        "time",
        "venue",
        "status",
        "link",
        "description"
    ].forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });

    return data;
}

router.get("/", async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });

        res.json({
            success: true,
            count: events.length,
            data: events
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch events"
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch event"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const event = await Event.create(pickEvent(req.body));

        res.status(201).json({
            success: true,
            message: "Event created successfully",
            data: event
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to create event"
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const event = await Event.findByIdAndUpdate(
            req.params.id,
            pickEvent(req.body),
            {
                new: true,
                runValidators: true
            }
        );

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.json({
            success: true,
            message: "Event updated successfully",
            data: event
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to update event"
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const event = await Event.findByIdAndDelete(req.params.id);

        if (!event) {
            return res.status(404).json({
                success: false,
                message: "Event not found"
            });
        }

        res.json({
            success: true,
            message: "Event deleted successfully"
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to delete event"
        });
    }
});

module.exports = router;
