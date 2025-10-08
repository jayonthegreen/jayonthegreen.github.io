import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

interface EnvConfig {
  GDRIVE_FOLDER_ID: string;
  GOOGLE_SERVICE_ACCOUNT_KEY: string;
  DEST_DIR: string;
}

function getRequiredEnv(key: string, defaultValue?: string): string {
  const value = process.env[key] || defaultValue;
  
  if (!value) {
    throw new Error(`Environment variable ${key} is required but not set`);
  }
  
  return value;
}

function getOptionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

export const env: EnvConfig = {
  GDRIVE_FOLDER_ID: getRequiredEnv('GDRIVE_FOLDER_ID'),
  GOOGLE_SERVICE_ACCOUNT_KEY: getRequiredEnv('GOOGLE_SERVICE_ACCOUNT_KEY'),
  DEST_DIR: getOptionalEnv('DEST_DIR', 'content/origin')
};

export default env;