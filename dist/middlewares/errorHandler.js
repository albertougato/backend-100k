"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const zod_1 = require("zod");
const BusinessError_1 = require("../errors/BusinessError");
function errorHandler(err, _req, res, _next) {
    console.error(err);
    if (err instanceof BusinessError_1.BusinessError) {
        res.status(err.statusCode).json({
            success: false,
            message: err.message,
        });
        return;
    }
    res.status(500).json({
        success: false,
        message: err.message,
    });
    if (err instanceof zod_1.ZodError) {
        return res.status(400).json({
            success: false,
            errors: err.issues,
        });
    }
}
