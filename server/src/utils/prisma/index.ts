import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { Pool } from "pg";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

declare global {
	// eslint-disable-next-line no-var
	var __prisma__: PrismaClient | undefined;
}

function createPrismaClient() {
	const accelerateUrl = process.env.PRISMA_ACCELERATE_URL;

	if (accelerateUrl) {
		return new PrismaClient({ accelerateUrl });
	}

	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		throw new Error("Missing DATABASE_URL or PRISMA_ACCELERATE_URL environment variable");
	}

	const adapter = new PrismaPg(
		new Pool({
			connectionString: databaseUrl,
		})
	);

	return new PrismaClient({ adapter });
}

export const prisma = globalThis.__prisma__ ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
	globalThis.__prisma__ = prisma;
}