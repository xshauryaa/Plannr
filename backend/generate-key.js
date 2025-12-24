import crypto from 'crypto';

// Generate a proper 32-byte base64-encoded encryption key
const key = crypto.randomBytes(32).toString('base64');
console.log('Generated ENCRYPTION_KEY:');
console.log(key);
console.log('\nAdd this to your .env file:');
console.log('ENCRYPTION_KEY=' + key);
