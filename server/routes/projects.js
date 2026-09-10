const express = require("express");
const router = express.Router();

const Project = require("../models/Project");
const protectMutations = require("../middleware/protectMutations");
const { handleRouteError } = require("../utils/routeError");

router.use(protectMutations);

function pickProject(body = {}) {
    const data = {};

    ["title", "team", "status", "description"].forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });

    return data;
}

router.get("/", async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: projects.length,
            data: projects
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch projects"
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch project"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const project = await Project.create(pickProject(req.body));

        res.status(201).json({
            success: true,
            message: "Project created successfully",
            data: project
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to create project"
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndUpdate(
            req.params.id,
            pickProject(req.body),
            {
                new: true,
                runValidators: true
            }
        );

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            message: "Project updated successfully",
            data: project
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to update project"
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const project = await Project.findByIdAndDelete(req.params.id);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: "Project not found"
            });
        }

        res.json({
            success: true,
            message: "Project deleted successfully"
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to delete project"
        });
    }
});

module.exports = router;
