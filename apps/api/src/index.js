"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const routesSocial_1 = __importDefault(require("./routesSocial"));
const routesNews_1 = __importDefault(require("./routesNews"));
// Configure dotenv to load environment variables
dotenv_1.default.config();
// Initialize Express app
const app = (0, express_1.default)();
// Add express.json() middleware
app.use(express_1.default.json());
// Add a simple test route
app.get('/', (req, res) => {
    res.json({ message: 'API server is running!' });
});
// Mount router from './routesSocial' at the path '/social'
app.use('/social', routesSocial_1.default);
// Mount router from './routesNews' at the path '/news'
app.use('/news', routesNews_1.default);
// Listen on port 3002 and log message
app.listen(3002, () => {
    console.log('API running on http://localhost:3002');
});
