import dotenv from 'dotenv';

// Load environment variables from .env.test file
dotenv.config({ path: '.env.test' });

// Set default test environment variables if not set
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.JWT_EXPIRATION = process.env.JWT_EXPIRATION || '1h';
process.env.JWT_REFRESH_EXPIRATION = process.env.JWT_REFRESH_EXPIRATION || '7d';
process.env.PORT = process.env.PORT || '3000';
process.env.NODE_ENV = 'test'; 