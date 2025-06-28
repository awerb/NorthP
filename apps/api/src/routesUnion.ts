import { Router, Request, Response } from 'express';

const router = Router();

// Sample union-related data for a legal firm
const unionData = {
  campaigns: [
    {
      id: 1,
      title: "Workers' Rights Campaign 2025",
      description: "Supporting fair wages and workplace safety for all workers",
      status: "active",
      participants: 1247,
      goal: 2000,
      progress: 62,
      startDate: "2025-01-15",
      endDate: "2025-12-31"
    },
    {
      id: 2,
      title: "Workplace Safety Advocacy",
      description: "Promoting safer working conditions in construction and manufacturing",
      status: "active",
      participants: 892,
      goal: 1500,
      progress: 59,
      startDate: "2025-02-01",
      endDate: "2025-11-30"
    },
    {
      id: 3,
      title: "Healthcare Benefits Initiative",
      description: "Ensuring adequate healthcare coverage for union members",
      status: "completed",
      participants: 1856,
      goal: 1500,
      progress: 100,
      startDate: "2024-08-01",
      endDate: "2024-12-31"
    }
  ],
  statistics: {
    totalMembers: 5420,
    activeCampaigns: 2,
    completedCampaigns: 1,
    totalFunds: 125000,
    casesWon: 89,
    casesInProgress: 23
  },
  recentActivity: [
    {
      id: 1,
      type: "campaign_update",
      title: "Workers' Rights Campaign milestone reached",
      description: "Over 1,200 workers have joined the campaign",
      timestamp: new Date().toISOString(),
      priority: "high"
    },
    {
      id: 2,
      type: "legal_victory",
      title: "Workplace safety case won",
      description: "$150K settlement for injured construction worker",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      priority: "high"
    },
    {
      id: 3,
      type: "member_milestone",
      title: "5,000 union members milestone",
      description: "Reached 5,000 active union members",
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      priority: "medium"
    }
  ]
};

// GET /union/campaigns - Get all campaigns
router.get('/campaigns', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      campaigns: unionData.campaigns,
      total: unionData.campaigns.length
    });
  } catch (error) {
    console.error('Error fetching campaigns:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns'
    });
  }
});

// GET /union/stats - Get union statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      statistics: unionData.statistics
    });
  } catch (error) {
    console.error('Error fetching statistics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics'
    });
  }
});

// GET /union/activity - Get recent activity
router.get('/activity', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      activity: unionData.recentActivity
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch activity'
    });
  }
});

// GET /union/dashboard - Get dashboard data
router.get('/dashboard', (req: Request, res: Response) => {
  try {
    res.json({
      success: true,
      data: {
        campaigns: unionData.campaigns.filter(c => c.status === 'active'),
        statistics: unionData.statistics,
        recentActivity: unionData.recentActivity.slice(0, 5)
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch dashboard data'
    });
  }
});

// POST /union/join-campaign - Join a campaign
router.post('/join-campaign', (req: Request, res: Response) => {
  try {
    const { campaignId } = req.body;
    
    if (!campaignId) {
      return res.status(400).json({
        success: false,
        error: 'Campaign ID is required'
      });
    }

    // Find the campaign
    const campaign = unionData.campaigns.find(c => c.id === parseInt(campaignId));
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      });
    }

    // Simulate joining the campaign
    campaign.participants += 1;
    campaign.progress = Math.round((campaign.participants / campaign.goal) * 100);

    res.json({
      success: true,
      message: 'Successfully joined campaign',
      campaign: campaign
    });
  } catch (error) {
    console.error('Error joining campaign:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to join campaign'
    });
  }
});

// Test route
router.get('/test', (req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'Union routes are working',
    timestamp: new Date().toISOString()
  });
});

export default router;
