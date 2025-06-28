import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

// Google Search Console client configuration
class GSCClient {
  private jwtClient: JWT | null = null;
  private webmasters: any = null;
  private readonly siteUrl = 'https://northpointtriallaw.com/';

  constructor() {
    this.initializeClient();
  }

  private initializeClient() {
    try {
      const serviceKeyBase64 = process.env.GSC_SERVICE_KEY;
      
      if (!serviceKeyBase64) {
        console.warn('GSC_SERVICE_KEY not configured');
        return;
      }

      // Decode base64 service key
      const serviceKeyJson = Buffer.from(serviceKeyBase64, 'base64').toString('utf-8');
      const serviceKey = JSON.parse(serviceKeyJson);

      // Create JWT client
      this.jwtClient = new JWT({
        email: serviceKey.client_email,
        key: serviceKey.private_key,
        scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
      });

      // Initialize webmasters API
      this.webmasters = google.webmasters({
        version: 'v3',
        auth: this.jwtClient,
      });

      console.log('Google Search Console client initialized successfully');
    } catch (error) {
      console.error('Error initializing GSC client:', error);
      this.jwtClient = null;
      this.webmasters = null;
    }
  }

  async authenticate(): Promise<boolean> {
    if (!this.jwtClient) {
      console.error('GSC client not initialized');
      return false;
    }

    try {
      await this.jwtClient.authorize();
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
    if (!this.webmasters || !this.jwtClient) {
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

      const response = await this.webmasters.searchanalytics.query(request);
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
    return this.jwtClient !== null && this.webmasters !== null;
  }
}

// Export singleton instance
export const gscClient = new GSCClient();
export default gscClient;
