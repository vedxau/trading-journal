const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const auth = require('../middleware/auth');

const router = express.Router();

// Cache for news data (in production, use Redis)
let newsCache = {
  data: null,
  timestamp: null,
  ttl: 5 * 60 * 1000 // 5 minutes
};

// Fetch red folder news from ForexFactory
async function fetchForexFactoryNews() {
  try {
    const response = await axios.get('https://www.forexfactory.com/calendar', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    const newsEvents = [];

    // Parse the calendar table
    $('.calendar__row').each((index, element) => {
      const $row = $(element);
      
      // Check if it's a red folder event (high impact)
      const impact = $row.find('.calendar__impact .icon--ff-impact-red').length > 0;
      
      if (impact) {
        const date = $row.find('.calendar__date').text().trim();
        const time = $row.find('.calendar__time').text().trim();
        const currency = $row.find('.calendar__currency').text().trim();
        const event = $row.find('.calendar__event').text().trim();
        
        if (date && event) {
          newsEvents.push({
            date,
            time,
            currency,
            event,
            impact: 'High',
            source: 'ForexFactory'
          });
        }
      }
    });

    return newsEvents;
  } catch (error) {
    console.error('Error fetching ForexFactory news:', error);
    return [];
  }
}

// Get economic news (cached)
router.get('/', auth, async (req, res) => {
  try {
    const now = Date.now();
    
    // Check if cache is still valid
    if (newsCache.data && (now - newsCache.timestamp) < newsCache.ttl) {
      return res.json({ news: newsCache.data });
    }

    // Fetch fresh data
    const news = await fetchForexFactoryNews();
    
    // Update cache
    newsCache = {
      data: news,
      timestamp: now,
      ttl: 5 * 60 * 1000
    };

    res.json({ news });
  } catch (error) {
    console.error('News fetch error:', error);
    res.status(500).json({ error: 'Server error fetching news' });
  }
});

// Get news for specific date range
router.get('/range', auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ error: 'Start date and end date are required' });
    }

    // For now, return cached news filtered by date
    // In a real implementation, you'd fetch specific date ranges
    const news = await fetchForexFactoryNews();
    
    // Filter by date range (simplified - you'd need proper date parsing)
    const filteredNews = news.filter(event => {
      // This is a simplified filter - you'd need proper date parsing
      return true; // Return all for now
    });

    res.json({ news: filteredNews });
  } catch (error) {
    console.error('News range fetch error:', error);
    res.status(500).json({ error: 'Server error fetching news range' });
  }
});

// Get upcoming high-impact news (next 24 hours)
router.get('/upcoming', auth, async (req, res) => {
  try {
    const news = await fetchForexFactoryNews();
    
    // Filter for upcoming events (next 24 hours)
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    
    const upcomingNews = news.filter(event => {
      // This is a simplified filter - you'd need proper date parsing
      return true; // Return all for now
    }).slice(0, 10); // Limit to 10 upcoming events

    res.json({ news: upcomingNews });
  } catch (error) {
    console.error('Upcoming news fetch error:', error);
    res.status(500).json({ error: 'Server error fetching upcoming news' });
  }
});

// Clear news cache (admin endpoint)
router.delete('/cache', auth, async (req, res) => {
  try {
    newsCache = {
      data: null,
      timestamp: null,
      ttl: 5 * 60 * 1000
    };
    
    res.json({ message: 'News cache cleared successfully' });
  } catch (error) {
    console.error('Cache clear error:', error);
    res.status(500).json({ error: 'Server error clearing cache' });
  }
});

module.exports = router;
