import dotenv from "dotenv";

dotenv.config();

// Validates that a required env variable exists — throws at startup if missing
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

// Single source of truth for all environment variables — typed and validated
export const env = {
  PORT: Number(process.env.PORT) || 8080,
  MONGO_URI: requireEnv("MONGO_URI"),
  REDSKY_TARGET_URL: requireEnv("REDSKY_TARGET_URL"),
  REDSKY_KEY: requireEnv("KEY"),
};
