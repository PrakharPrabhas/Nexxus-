const express = require("express");
const router = express.Router();

const Gallery = require("../models/Gallery");
const protectMutations = require("../middleware/protectMutations");
const { handleRouteError } = require("../utils/routeError");

router.use(protectMutations);

function pickGallery(body = {}) {
    const data = {};
    const imageUrl = body.imageUrl || body.image;

    if (imageUrl !== undefined) {
        data.imageUrl = imageUrl;
    }

    ["title", "category", "description", "status"].forEach((field) => {
        if (body[field] !== undefined) {
            data[field] = body[field];
        }
    });

    return data;
}

router.get("/", async (req, res) => {
    try {
        const gallery = await Gallery.find().sort({ createdAt: -1 });

        res.json({
            success: true,
            count: gallery.length,
            data: gallery
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch gallery"
        });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const item = await Gallery.findById(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Gallery item not found"
            });
        }

        res.json({
            success: true,
            data: item
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to fetch gallery item"
        });
    }
});

router.post("/", async (req, res) => {
    try {
        const item = await Gallery.create(pickGallery(req.body));

        res.status(201).json({
            success: true,
            message: "Gallery item created successfully",
            data: item
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to create gallery item"
        });
    }
});

router.put("/:id", async (req, res) => {
    try {
        const item = await Gallery.findByIdAndUpdate(
            req.params.id,
            pickGallery(req.body),
            {
                new: true,
                runValidators: true
            }
        );

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Gallery item not found"
            });
        }

        res.json({
            success: true,
            message: "Gallery item updated successfully",
            data: item
        });
    } catch (error) {
        handleRouteError(res, error, {
            status: 400,
            message: error.message || "Failed to update gallery item"
        });
    }
});

router.delete("/:id", async (req, res) => {
    try {
        const item = await Gallery.findByIdAndDelete(req.params.id);

        if (!item) {
            return res.status(404).json({
                success: false,
                message: "Gallery item not found"
            });
        }

        res.json({
            success: true,
            message: "Gallery item deleted successfully"
        });
    } catch (error) {
        handleRouteError(res, error, {
            message: "Failed to delete gallery item"
        });
    }
});

module.exports = router;
