import { autoSyncProfiles } from '../../server/server.js';

export const handler = async (event, context) => {
  console.log('[CRON] Netlify 10-minute scheduled sync function triggered.');
  try {
    await autoSyncProfiles();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true, message: 'Scheduled 10-minute HackerRank sync completed.' })
    };
  } catch (err) {
    console.error('[CRON] Scheduled sync error:', err.message);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false, error: err.message })
    };
  }
};
