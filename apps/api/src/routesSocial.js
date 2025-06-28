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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const openai_1 = __importDefault(require("openai"));
const router = (0, express_1.Router)();
// Helper function to validate and sanitize prompt
const validatePrompt = (prompt) => {
    // Check if prompt exists and is a string
    if (!prompt || typeof prompt !== 'string') {
        return { isValid: false, error: 'Prompt is required and must be a string.' };
    }
    // Check if prompt is not empty after trimming
    const trimmedPrompt = prompt.trim();
    if (trimmedPrompt.length === 0) {
        return { isValid: false, error: 'Prompt cannot be empty.' };
    }
    // Check minimum length
    if (trimmedPrompt.length < 3) {
        return { isValid: false, error: 'Prompt must be at least 3 characters long.' };
    }
    // Check maximum length (reasonable limit)
    if (trimmedPrompt.length > 500) {
        return { isValid: false, error: 'Prompt must be less than 500 characters.' };
    }
    // Basic content filtering for abusive content
    const abusivePatterns = [
        /\b(hate|kill|murder|violence|abuse|racist|sexist|nazi|terrorist)\b/i,
        /\b(fuck|shit|damn|bitch|asshole|bastard)\b/i,
        /\b(suicide|self-harm|cutting|overdose)\b/i
    ];
    for (const pattern of abusivePatterns) {
        if (pattern.test(trimmedPrompt)) {
            return { isValid: false, error: 'Prompt contains inappropriate content. Please use professional language.' };
        }
    }
    return { isValid: true };
};
// Helper function to handle OpenAI errors with friendly messages
const handleOpenAIError = (error) => {
    var _a, _b;
    // Rate limit errors
    if (error.status === 429) {
        return {
            status: 429,
            message: 'Too many requests. Please wait a moment before trying again.'
        };
    }
    // Authentication errors
    if (error.status === 401) {
        return {
            status: 500,
            message: 'API authentication failed. Please contact support.'
        };
    }
    // Content policy violations
    if (error.status === 400 && ((_a = error.message) === null || _a === void 0 ? void 0 : _a.includes('content_policy'))) {
        return {
            status: 400,
            message: 'Your prompt violates content policy. Please try a different prompt.'
        };
    }
    // Token limit errors
    if ((_b = error.message) === null || _b === void 0 ? void 0 : _b.includes('maximum context length')) {
        return {
            status: 400,
            message: 'Your prompt is too long. Please shorten it and try again.'
        };
    }
    // Network errors
    if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
        return {
            status: 503,
            message: 'Service temporarily unavailable. Please try again later.'
        };
    }
    // Generic server error
    return {
        status: 500,
        message: 'An unexpected error occurred while generating captions. Please try again.'
    };
};
router.post('/generate', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { prompt } = req.body;
        // Validate request body exists
        if (!req.body) {
            return res.status(400).json({
                error: 'Request body is required.'
            });
        }
        // Validate prompt
        const validation = validatePrompt(prompt);
        if (!validation.isValid) {
            return res.status(400).json({
                error: validation.error
            });
        }
        // Check if API key is properly configured
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'your_openai_api_key_here') {
            return res.status(500).json({
                error: 'Service temporarily unavailable. Please try again later.'
            });
        }
        // Initialize OpenAI with API key from environment variables
        const openai = new openai_1.default({
            apiKey: process.env.OPENAI_API_KEY,
        });
        const trimmedPrompt = prompt.trim();
        // Call OpenAI API
        const response = yield openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            temperature: 0.85,
            max_tokens: 64,
            n: 3,
            messages: [
                {
                    role: 'system',
                    content: 'Write a clever tweet-length caption for a personal-injury law firm. Keep it professional, empathetic, and under 280 characters. Focus on helping clients and providing legal support.',
                },
                { role: 'user', content: trimmedPrompt },
            ],
        });
        // Validate response
        if (!response.choices || response.choices.length === 0) {
            return res.status(500).json({
                error: 'No captions were generated. Please try again with a different prompt.'
            });
        }
        // Extract and clean completions
        const completions = response.choices
            .map((choice) => { var _a, _b; return (_b = (_a = choice.message) === null || _a === void 0 ? void 0 : _a.content) === null || _b === void 0 ? void 0 : _b.trim(); })
            .filter((content) => Boolean(content && content.length > 0));
        // Ensure we have at least one valid completion
        if (completions.length === 0) {
            return res.status(500).json({
                error: 'No valid captions were generated. Please try again with a different prompt.'
            });
        }
        // Return successful response
        res.json(completions);
    }
    catch (err) {
        console.error('Error in /generate route:', {
            message: err.message,
            status: err.status,
            code: err.code,
            timestamp: new Date().toISOString()
        });
        const errorResponse = handleOpenAIError(err);
        res.status(errorResponse.status).json({
            error: errorResponse.message
        });
    }
}));
exports.default = router;
