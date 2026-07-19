const express = require('express');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Fallback ICE servers — STUN only (works for same-network / simple NAT)
const FALLBACK_ICE_SERVERS = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
  { urls: 'stun:stun2.l.google.com:19302' },
  { urls: 'stun:stun3.l.google.com:19302' },
  { urls: 'stun:stun4.l.google.com:19302' }
];

// @desc    Get TURN server credentials for WebRTC
// @route   GET /api/turn
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    const apiKey = process.env.METERED_API_KEY;
    const appName = process.env.METERED_APP_NAME;

    // If Metered.ca credentials are configured, fetch fresh temporary credentials
    if (apiKey && appName) {
      const response = await fetch(
        `https://${appName}.metered.live/api/v1/turn/credentials?apiKey=${apiKey}`
      );

      if (response.ok) {
        const iceServers = await response.json();
        return res.json({ success: true, iceServers });
      }

      console.warn('Metered.ca TURN fetch failed, falling back to static servers');
    }

    // Fallback: return STUN-only servers
    // Video calls may not work across different networks without TURN
    return res.json({ success: true, iceServers: FALLBACK_ICE_SERVERS });
  } catch (error) {
    console.error('TURN credentials error:', error);
    // Always return something so calls can still attempt
    return res.json({ success: true, iceServers: FALLBACK_ICE_SERVERS });
  }
});

module.exports = router;
