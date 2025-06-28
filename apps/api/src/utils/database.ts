import { Pool, PoolConfig } from 'pg';

/**
 * Creates a PostgreSQL connection pool using either DATABASE_URL or individual environment variables
 * Supports Railway's standard DATABASE_URL format and fallback to individual variables
 */
export function createDatabasePool(): Pool | null {
  try {
    let poolConfig: PoolConfig;

    // Check if DATABASE_URL is provided (Railway standard)
    if (process.env.DATABASE_URL) {
      poolConfig = {
        connectionString: process.env.DATABASE_URL,
        // SSL configuration for production databases
        ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
      };
    } else {
      // Fallback to individual environment variables (local development)
      poolConfig = {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME || 'northpoint',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD,
      };
    }

    return new Pool(poolConfig);
  } catch (error) {
    console.error('Failed to create database pool:', error);
    return null;
  }
}

/**
 * Tests database connection and returns whether it's working
 */
export async function testDatabaseConnection(pool: Pool): Promise<boolean> {
  try {
    const client = await pool.connect();
    await client.query('SELECT 1');
    client.release();
    return true;
  } catch (error) {
    console.warn('Database connection test failed:', error instanceof Error ? error.message : 'Unknown error');
    return false;
  }
}
