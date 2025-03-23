"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthClient = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
var client_1 = require("./client");
Object.defineProperty(exports, "AuthClient", { enumerable: true, get: function () { return client_1.AuthClient; } });
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Validate CORS origin
const validateOrigin = (origin, callback) => {
    if (!origin) {
        // Allow requests with no origin (like mobile apps or curl requests)
        callback(null, true);
        return;
    }
    const allowedOrigins = process.env.NODE_ENV === 'production'
        ? [process.env.FRONTEND_URL].filter(Boolean) // Remove undefined/empty values
        : ['http://localhost:3000'];
    if (allowedOrigins.includes(origin)) {
        callback(null, true);
    }
    else {
        callback(new Error('Not allowed by CORS'));
    }
};
// Middleware
app.use((0, cors_1.default)({
    origin: validateOrigin,
    methods: ['GET', 'POST'], // Only allow needed methods
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // Cache preflight request for 24 hours
}));
app.use((0, helmet_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
// Routes
app.use('/auth', auth_1.default);
// Error handling middleware
app.use((err, _req, res, _next) => {
    console.error(err.stack);
    const errorMessage = err instanceof Error ? err.message : 'Something went wrong!';
    res.status(500).json({ message: errorMessage });
});
const PORT = process.env.PORT || 5001;
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
}
exports.default = app;
