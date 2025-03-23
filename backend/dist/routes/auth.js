"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../utils/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Validation middleware
const validateRegisterInput = (req, res, next) => {
    const { email, password, name } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    if (password.length < 6) {
        res.status(400).json({ message: 'Password must be at least 6 characters long' });
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        res.status(400).json({ message: 'Invalid email format' });
        return;
    }
    next();
};
const validateLoginInput = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({ message: 'Email and password are required' });
        return;
    }
    next();
};
// Register new user
const registerHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password, name } = req.body;
        // Check if user already exists
        const existingUser = yield prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Hash password
        const hashedPassword = yield (0, auth_1.hashPassword)(password);
        // Create new user
        const user = yield prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name
            }
        });
        // Generate token
        const token = (0, auth_1.generateToken)(user);
        // Return user data and token
        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});
// Login user
const loginHandler = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        // Find user
        const user = yield prisma.user.findUnique({
            where: { email }
        });
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Verify password
        const isValidPassword = yield (0, auth_1.comparePasswords)(password, user.password);
        if (!isValidPassword) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Generate token
        const token = (0, auth_1.generateToken)(user);
        // Return user data and token
        res.json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role
            },
            token
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});
// Apply validation middleware
router.post('/register', validateRegisterInput, registerHandler);
router.post('/login', validateLoginInput, loginHandler);
exports.default = router;
