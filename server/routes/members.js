const express = require("express");
const router = express.Router();

const Member = require("../models/Member");
const protectMutations = require("../middleware/protectMutations");
const { handleRouteError } = require("../utils/routeError");

router.use(protectMutations);

function pickMember(body = {}) {
    const data = {};

    [
        "name",
        "role",
        "group",
        "email",
        "photo",
        "description",
        "status"
    ].forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });

    return data;
}

router.get("/", async (req, res) => {
    try {
        const members = await Member.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: members.length,
            data: members
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch members"
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const member = await Member.findById(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        res.json({
            success: true,
            data: member
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch member"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const member = await Member.create(pickMember(req.body));

        res.status(201).json({
            success: true,
            message: "Member created successfully",
            data: member
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to create member"
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const member = await Member.findByIdAndUpdate(
            req.params.id,
            pickMember(req.body),
            {
                new: true,
                runValidators: true
            }
        );

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        res.json({
            success: true,
            message: "Member updated successfully",
            data: member
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to update member"
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const member = await Member.findByIdAndDelete(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: "Member not found"
            });
        }

        res.json({
            success: true,
            message: "Member deleted successfully"
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to delete member"
        });
    }
});

module.exports = router;
