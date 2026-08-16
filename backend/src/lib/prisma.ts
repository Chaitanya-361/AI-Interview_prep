import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// 1. Create a PostgreSQL connection pool using our DATABASE_URL
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});
// 2. Wrap the connection pool with Prisma 7's adapter
const adapter = new PrismaPg(pool);
// 3. Pass the adapter to PrismaClient
export const prisma = new PrismaClient({ adapter });

