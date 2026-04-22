import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

function getEnv(key: string, required = true): string {
  const value = process.env[key];
  if (!value && required) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value as string;
}

export const config = {
  app: {
    env: getEnv("NODE_ENV", false) || "development",
    port: parseInt(getEnv("PORT", false) || "3000", 10),
  },
  db: {
    url: getEnv("DATABASE_URL"),
  },
  auth: {
    jwtSecret: getEnv("JWT_SECRET"),
  },
  cloudinary: {
    cloudName: getEnv("CLOUDINARY_CLOUD_NAME"),
    apiKey: getEnv("CLOUDINARY_API_KEY"),
    apiSecret: getEnv("CLOUDINARY_API_SECRET"),
  }
};
