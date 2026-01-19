import 'dotenv/config';

// Debug environment variables in production
if (process.env.NODE_ENV === 'production') {
    console.log('🔍 Environment variables debug:');
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL);
    console.log('DATABASE_URL length:', process.env.DATABASE_URL?.length || 0);
    console.log('API_URL exists:', !!process.env.API_URL);
    console.log('NODE_ENV:', process.env.NODE_ENV);
}

export const ENV = {
    PORT: process.env.PORT || 5001,
    DATABASE_URL: process.env.DATABASE_URL,
    NODE_ENV: process.env.NODE_ENV || 'development',
    AUTH_DEV: process.env.AUTH_DEV === 'true',
    API_URL: process.env.API_URL || 'https://plannr-690n.onrender.com', // Your Render deployment URL
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
    GEMINI_API_KEY: process.env.GEMINI_API_KEY,
}