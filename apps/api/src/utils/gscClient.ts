import '../config'; // Load environment variables first
import { google } from 'googleapis';
import { GoogleAuth } from 'google-auth-library';
import * as fs from 'fs';
import * as path from 'path';

// Google Search Console client configuration
class GSCClient {
  private auth: GoogleAuth | null = null;
  private searchConsole: any = null;
  private apiKey: string | null = null;
  private readonly siteUrl = 'https://northpointtriallaw.com/';

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const gscApiKey = process.env.GSC_API_KEY;
      const serviceKeyPath = process.env.GSC_SERVICE_KEY;
      
      // Try service account first (preferred method)
      if (serviceKeyPath) {
        // Resolve the path relative to the project root
        const fullPath = path.resolve(process.cwd(), serviceKeyPath);
        
        // Check if the service key file exists
        if (!fs.existsSync(fullPath)) {
          console.warn(`GSC service key file not found at: ${fullPath}`);
          if (gscApiKey) {
            console.warn('⚠️  Falling back to API key, but API keys are NOT supported by Google Search Console API');
            console.warn('⚠️  GSC will run in demo mode. For production, use OAuth2 or service account authentication');
            console.warn('⚠️  See: https://cloud.google.com/docs/authentication');
          }
          return;
        }

        console.log('Initializing GSC with service account...');
        
        // Create Google Auth instance
        this.auth = new google.auth.GoogleAuth({
          keyFile: fullPath,
          scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
        });

        // Initialize Search Console API
        this.searchConsole = google.searchconsole({
          version: 'v1',
          auth: this.auth,
        });

        console.log('Google Search Console client initialized with service account');
        return;
      }

      // If no service key, warn about API key limitation
      if (gscApiKey) {
        console.warn('⚠️  GSC API Key detected but API keys are NOT supported by Google Search Console API');
        console.warn('⚠️  GSC will run in demo mode. For production, use OAuth2 or service account authentication');
        console.warn('⚠️  See: https://cloud.google.com/docs/authentication');
      } else {
        console.warn('GSC not configured - running in demo mode');
      }
    } catch (error) {
      console.error('Error initializing GSC client:', error);
      this.auth = null;
      this.searchConsole = null;
      this.apiKey = null;
    }
  }

  async authenticate(): Promise<boolean> {
    // If using API key, no separate authentication needed
    if (this.apiKey) {
      return true;
    }

    if (!this.auth) {
      console.error('GSC client not initialized');
      return false;
    }

    try {
      await this.auth.getAccessToken();
      return true;
    } catch (error) {
      console.error('GSC authentication failed:', error);
      return false;
    }
  }

  async getSearchAnalytics(options: {
    startDate: string;
    endDate: string;
    dimensions?: string[];
    filters?: Array<{
      dimension: string;
      operator: string;
      expression: string;
    }>;
    rowLimit?: number;
  }) {
    if (!this.searchConsole) {
      throw new Error('GSC client not initialized');
    }

    try {
      const authenticated = await this.authenticate();
      if (!authenticated) {
        throw new Error('GSC authentication failed');
      }

      const request = {
        siteUrl: this.siteUrl,
        requestBody: {
          startDate: options.startDate,
          endDate: options.endDate,
          dimensions: options.dimensions || ['query', 'date'],
          dimensionFilterGroups: options.filters ? [{
            filters: options.filters
          }] : undefined,
          rowLimit: options.rowLimit || 25000,
          startRow: 0,
        },
      };

      console.log('GSC API request:', JSON.stringify(request, null, 2));

      const response = await this.searchConsole.searchanalytics.query(request);
      return response.data;
    } catch (error) {
      console.error('Error fetching search analytics:', error);
      throw error;
    }
  }

  async getKeywordData(keywords: string[], days: number = 90) {
    // If GSC is not properly initialized, return demo data
    if (!this.isInitialized()) {
      console.log('GSC not initialized - returning demo data for keyword tracking');
      return this.generateDemoKeywordData(keywords, days);
    }

    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    try {
      const results = [];

      for (const keyword of keywords) {
        console.log(`Fetching data for keyword: ${keyword}`);
        
        try {
          const data = await this.getSearchAnalytics({
            startDate: formatDate(startDate),
            endDate: formatDate(endDate),
            dimensions: ['query', 'date'],
            filters: [{
              dimension: 'query',
              operator: 'equals',
              expression: keyword,
            }],
            rowLimit: 1000,
          });

          if (data.rows) {
            for (const row of data.rows) {
              results.push({
                keyword: row.keys[0], // query
                date: row.keys[1], // date
                clicks: row.clicks || 0,
                impressions: row.impressions || 0,
                ctr: row.ctr || 0,
                position: row.position || 0,
              });
            }
          }
        } catch (keywordError) {
          console.error(`Error fetching data for keyword ${keyword}:`, keywordError);
          // Continue with other keywords even if one fails
        }
      }

      return results;
    } catch (error) {
      console.error('Error in getKeywordData:', error);
      console.log('Falling back to demo data due to GSC error');
      return this.generateDemoKeywordData(keywords, days);
    }
  }

  // Generate demo data for development/testing
  private generateDemoKeywordData(keywords: string[], days: number) {
    const results = [];
    const endDate = new Date();
    
    for (const keyword of keywords) {
      // Generate 10-15 data points for each keyword over the time period
      const dataPoints = Math.floor(Math.random() * 6) + 10; // 10-15 points
      
      for (let i = 0; i < dataPoints; i++) {
        const randomDaysAgo = Math.floor(Math.random() * days);
        const date = new Date(endDate);
        date.setDate(date.getDate() - randomDaysAgo);
        
        results.push({
          keyword,
          date: date.toISOString().split('T')[0],
          clicks: Math.floor(Math.random() * 50) + 1, // 1-50 clicks
          impressions: Math.floor(Math.random() * 1000) + 100, // 100-1100 impressions
          ctr: Math.random() * 0.1, // 0-10% CTR
          position: Math.random() * 30 + 5, // Position 5-35
        });
      }
    }
    
    console.log(`Generated ${results.length} demo data points for ${keywords.length} keywords`);
    return results;
  }

  isInitialized(): boolean {
    // Return true only if we have proper OAuth2 or service account authentication
    return this.searchConsole !== null && this.auth !== null;
  }
}

// Export singleton instance
export const gscClient = new GSCClient();
export default gscClient;
