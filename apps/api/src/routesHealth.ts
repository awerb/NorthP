import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import { OpenAI } from 'openai';
import { createDatabasePool, testDatabaseConnection } from './utils/database';
import gscClient from './utils/gscClient';

const router = Router();

// Health check endpoint
router.get('/status', async (req: Request, res: Response) => {
  const healthStatus = {
    timestamp: new Date().toISOString(),
    services: {} as any,
    overall: 'healthy'
  };

  try {
    // 1. Check API Server (always healthy if we reach here)
    const apiStart = Date.now();
    healthStatus.services.api = {
      status: 'online',
      latency: `${Date.now() - apiStart}ms`,
      statusType: 'success'
    };

    // 2. Check Database Connection
    const dbStart = Date.now();
    let dbPool: Pool | null = null;
    try {
      dbPool = createDatabasePool();
      const dbConnected = dbPool ? await testDatabaseConnection(dbPool) : false;
      
      healthStatus.services.database = {
        status: dbConnected ? 'connected' : 'demo mode',
        latency: `${Date.now() - dbStart}ms`,
        statusType: dbConnected ? 'success' : 'warning'
      };
      
      if (!dbConnected) {
        healthStatus.overall = 'degraded';
      }
    } catch (error) {
      healthStatus.services.database = {
        status: 'error',
        latency: `${Date.now() - dbStart}ms`,
        statusType: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
      healthStatus.overall = 'degraded';
    }

    // 3. Check AI Services (OpenAI)
    const aiStart = Date.now();
    try {
      if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_openai_api_key_here') {
        // Quick API validation call
        const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
        // This is a minimal request to test connectivity
        await openai.models.list();
        
        healthStatus.services.ai = {
          status: 'connected',
          latency: `${Date.now() - aiStart}ms`,
          statusType: 'success'
        };
      } else {
        healthStatus.services.ai = {
          status: 'not configured',
          latency: '--',
          statusType: 'warning'
        };
        healthStatus.overall = 'degraded';
      }
    } catch (error) {
      healthStatus.services.ai = {
        status: 'error',
        latency: `${Date.now() - aiStart}ms`,
        statusType: 'error'
      };
      healthStatus.overall = 'degraded';
    }

    // 4. Check Google Search Console
    const gscStart = Date.now();
    try {
      const gscInitialized = gscClient.isInitialized();
      let gscAuthenticated = false;
      
      if (gscInitialized) {
        try {
          gscAuthenticated = await gscClient.authenticate();
        } catch (error) {
          // GSC auth failed
        }
      }

      if (gscInitialized && gscAuthenticated) {
        healthStatus.services.searchConsole = {
          status: 'connected',
          latency: `${Date.now() - gscStart}ms`,
          statusType: 'success'
        };
      } else {
        // Check the actual GSC configuration status
        const hasApiKey = process.env.GSC_API_KEY;
        const hasServiceKey = process.env.GSC_SERVICE_KEY;
        
        if (hasServiceKey) {
          // Service key is configured but file might not exist or auth failed
          const fs = require('fs');
          const path = require('path');
          const fullPath = path.resolve(process.cwd(), hasServiceKey);
          const serviceKeyExists = fs.existsSync(fullPath);
          
          if (!serviceKeyExists) {
            healthStatus.services.searchConsole = {
              status: 'demo mode (service key file missing)',
              latency: '--',
              statusType: 'warning',
              message: `Service key file not found at: ${hasServiceKey}`
            };
          } else {
            healthStatus.services.searchConsole = {
              status: 'auth failed',
              latency: `${Date.now() - gscStart}ms`,
              statusType: 'error'
            };
            healthStatus.overall = 'degraded';
          }
        } else if (hasApiKey) {
          healthStatus.services.searchConsole = {
            status: 'demo mode (API key not supported)',
            latency: '--',
            statusType: 'warning',
            message: 'GSC requires OAuth2 or service account auth'
          };
        } else {
          healthStatus.services.searchConsole = {
            status: 'demo mode (not configured)',
            latency: '--',
            statusType: 'warning', 
            message: 'GSC_SERVICE_KEY not configured'
          };
        }
      }
    } catch (error) {
      healthStatus.services.searchConsole = {
        status: 'error',
        latency: '--',
        statusType: 'error'
      };
      healthStatus.overall = 'degraded';
    }

    res.json({
      success: true,
      health: healthStatus
    });

  } catch (error) {
    console.error('Error in health check:', error);
    res.status(500).json({
      success: false,
      error: 'Health check failed',
      health: {
        ...healthStatus,
        overall: 'unhealthy'
      }
    });
  }
});

// Quick ping endpoint
router.get('/ping', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'pong',
    timestamp: new Date().toISOString()
  });
});

export default router;
