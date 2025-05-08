// src/core/app.ts
import express from 'express';
import cors from 'cors';
import { errorHandler } from '../shared/middlewares/ErrorHandling';

// Import routes
import APIsGateway from '../presentation/APIsGateway';

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes with API versioning
app.use('/api/v1', APIsGateway);

// Backward compatibility for any existing clients
app.use('/api', APIsGateway);

// Error handling
app.use(errorHandler);

export default app;