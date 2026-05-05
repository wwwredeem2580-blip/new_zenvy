export function validateEnv() {
  const REQUIRED_ENV_VARS = [
    'MONGO_URI',
    'JWT_ACCESS_TOKEN_SECRET',
    'BACKBLAZE_KEY_ID',
    'BACKBLAZE_APP_KEY',
    'BACKBLAZE_BUCKET_NAME'
  ];

  const missing = REQUIRED_ENV_VARS.filter(v => !process.env[v]);
  
  if (missing.length > 0) {
    console.error(`[CRITICAL] Missing required environment variables: ${missing.join(', ')}`);
    console.error('Server cannot start without these variables. Exiting...');
    process.exit(1);
  }
}
