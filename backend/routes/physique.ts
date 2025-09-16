import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth';
import { validateBody, schemas } from '../middleware/validation';
import { PhysiqueAnalysisService } from '../services/physique-analysis';
import type { PhysiqueAnalysisRequest } from '@/types/ai';

type Variables = {
  userId: string;
  userRole: 'free' | 'premium';
  validatedData: PhysiqueAnalysisRequest;
};

const physiqueRouter = new Hono<{ Variables: Variables }>();
const physiqueService = new PhysiqueAnalysisService();

// Analyze physique photos
physiqueRouter.post(
  '/analyze',
  authMiddleware,
  validateBody(schemas.physiqueAnalysis),
  async (c) => {
    try {
      const validatedData = c.get('validatedData');
      const userId = c.get('userId');
      
      console.log(`Analyzing physique for user ${userId}:`, validatedData.poseType);
      
      const analysis = await physiqueService.analyzePhysique(validatedData);
      
      // TODO: Save analysis to database with userId
      
      return c.json({
        success: true,
        data: analysis
      });
    } catch (error) {
      console.error('Physique analysis error:', error);
      return c.json({
        success: false,
        error: error instanceof Error ? error.message : 'Analysis failed'
      }, 500);
    }
  }
);

// Get physique analysis history
physiqueRouter.get('/history', authMiddleware, async (c) => {
  try {
    const userId = c.get('userId');
    
    console.log(`Fetching physique history for user: ${userId}`);
    
    // TODO: Fetch from database
    const mockHistory = [
      {
        id: '1',
        poseType: 'front',
        date: '2024-01-15',
        metrics: {
          muscleMass: 78,
          bodyFat: 12,
          symmetry: 8,
          posture: 9,
          overallConvexity: 7
        }
      }
    ];
    
    return c.json({
      success: true,
      data: mockHistory
    });
  } catch (error) {
    console.error('History fetch error:', error);
    return c.json({
      success: false,
      error: 'Failed to fetch history'
    }, 500);
  }
});

// Compare two analyses
physiqueRouter.post('/compare', authMiddleware, async (c) => {
  try {
    const { currentId, previousId } = await c.req.json();
    
    console.log(`Comparing analyses: ${previousId} vs ${currentId}`);
    
    // TODO: Fetch analyses from database and compare
    const comparison = {
      improvements: ['Chest development', 'Shoulder width'],
      regressions: [],
      recommendations: ['Continue current chest routine', 'Add lateral raises']
    };
    
    return c.json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Comparison error:', error);
    return c.json({
      success: false,
      error: 'Failed to compare analyses'
    }, 500);
  }
});

export { physiqueRouter };