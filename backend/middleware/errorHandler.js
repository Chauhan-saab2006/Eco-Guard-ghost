"use strict";

/**
 * Global error handling middleware for Express.
 * Catches any error passed via next(err) and returns a consistent JSON response.
 */
const errorHandler = (err, req, res, next) => {
    console.error(`[ERROR] ${req.method} ${req.path} —`, err.message || err);

    // Zod validation errors
    if (err.name === "ZodError") {
        return res.status(400).json({
            success: false,
            error: "Validation Error",
            details: err.errors,
        });
    }

    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({
        success: false,
        error: message,
    });
};

/**
 * 404 handler — mount AFTER all routes.
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        error: `Route not found: ${req.method} ${req.path}`,
    });
};

module.exports = { errorHandler, notFoundHandler };
