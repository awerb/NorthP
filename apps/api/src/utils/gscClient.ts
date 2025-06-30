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
      
      // Try API key first
      if (gscApiKey) {
        console.log('Initializing GSC with API key...');
        this.apiKey = gscApiKey;
        
        // Initialize Search Console API with API key
        this.searchConsole = google.searchconsole({
          version: 'v1',
          auth: gscApiKey,
        });

        console.log('Google Search Console client initialized with API key');
        return;
      }
      
      // Fall back to service account if no API key
      if (!serviceKeyPath) {
        console.warn('Neither GSC_API_KEY nor GSC_SERVICE_KEY configured');
        return;
      }

      // Resolve the path relative to the project root
      const fullPath = path.resolve(process.cwd(), serviceKeyPath);
      
      // Check if the service key file exists
      if (!fs.existsSync(fullPath)) {
        console.warn(`GSC service key file not found at: ${fullPath}`);
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
      throw error;
    }
  }

  isInitialized(): boolean {
    return this.searchConsole !== null && (this.apiKey !== null || this.auth !== null);
  }
}

// Export singleton instance
export const gscClient = new GSCClient();
export default gscClient;
