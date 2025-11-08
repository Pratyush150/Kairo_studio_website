import express from 'express';

const router = express.Router();

// POST /api/analytics - Track analytics events
router.post('/', async (req, res) => {
  try {
    const { event, data, timestamp, url, userAgent } = req.body;

    // Log the event (in production, you'd save to database or send to analytics service)
    console.log('📊 Analytics Event:', {
      event,
      data,
      timestamp,
      url,
      userAgent: userAgent?.substring(0, 100) // Truncate for logging
    });

    // In production, you would:
    // 1. Save to analytics database
    // 2. Send to analytics service (Google Analytics, Mixpanel, etc.)
    // 3. Trigger business logic based on events

    res.status(200).json({
      success: true,
      message: 'Event tracked'
    });

  } catch (err) {
    console.error('Analytics error:', err);
    // Don't fail the request for analytics errors
    res.status(200).json({
      success: false,
      message: 'Analytics tracking failed'
    });
  }
});

export default router;
