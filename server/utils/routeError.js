function isInvalidId(error) {
    return error && error.name === "CastError";
}

function handleRouteError(res, error, {
    status = 500,
    message = "Request failed"
} = {}) {
    if (isInvalidId(error)) {
        return res.status(400).json({
            success: false,
            message: "Invalid ID"
        });
    }

    console.error(error);

    return res.status(status).json({
        success: false,
        message
    });
}

module.exports = {
    isInvalidId,
    handleRouteError
};
