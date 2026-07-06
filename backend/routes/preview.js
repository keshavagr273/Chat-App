const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
  const { url } = req.query;

  if (!url) {
    return res.status(400).json({ error: 'URL is required' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch URL');
    }

    const html = await response.text();

    const titleMatch = html.match(/<meta[^>]*property="og:title"[^>]*content="([^"]*)"[^>]*>/i) || 
                       html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:title"[^>]*>/i) ||
                       html.match(/<title>([^<]*)<\/title>/i);
                       
    const descMatch = html.match(/<meta[^>]*property="og:description"[^>]*content="([^"]*)"[^>]*>/i) ||
                      html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:description"[^>]*>/i) ||
                      html.match(/<meta[^>]*name="description"[^>]*content="([^"]*)"[^>]*>/i);
                      
    const imageMatch = html.match(/<meta[^>]*property="og:image"[^>]*content="([^"]*)"[^>]*>/i) ||
                       html.match(/<meta[^>]*content="([^"]*)"[^>]*property="og:image"[^>]*>/i);

    res.json({
      title: titleMatch ? titleMatch[1] : new URL(url).hostname,
      description: descMatch ? descMatch[1] : '',
      image: imageMatch ? imageMatch[1] : ''
    });

  } catch (error) {
    console.error('Link preview error:', error.message);
    res.status(500).json({ error: 'Failed to generate preview' });
  }
});

module.exports = router;
