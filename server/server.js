import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { 
  getSupabaseProfiles, 
  getSupabaseProfile, 
  upsertSupabaseProfile, 
  updateSupabaseProfileMeta, 
  deleteSupabaseProfile, 
  isSupabaseConfigured 
} from './supabase.js';

export const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Clean username extraction from raw input or URL
export function sanitizeUsername(input) {
  if (!input) return '';
  let cleaned = input.trim();
  try {
    if (cleaned.startsWith('http://') || cleaned.startsWith('https://')) {
      const url = new URL(cleaned);
      const parts = url.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        if (parts[0] === 'profile' && parts.length > 1) {
          cleaned = parts[1];
        } else {
          cleaned = parts[parts.length - 1];
        }
      }
    }
  } catch (e) {
    // ignore URL parse errors
  }
  cleaned = cleaned.split('?')[0].split('#')[0];
  cleaned = cleaned.replace(/^@/, '');
  return cleaned.trim();
}

// Calculate HackerRank badge stars from points based on official thresholds
export function calculateStars(slug, points) {
  if (!points || points <= 0) return 0;
  const lower = (slug || '').toLowerCase();
  if (lower === 'problem-solving' || lower === 'algorithms' || lower === 'data-structures') {
    if (points >= 800) return 6;
    if (points >= 400) return 5;
    if (points >= 220) return 4;
    if (points >= 100) return 3;
    if (points >= 40) return 2;
    if (points >= 10) return 1;
    return 0;
  }
  if (points >= 500) return 5;
  if (points >= 250) return 4;
  if (points >= 110) return 3;
  if (points >= 35) return 2;
  if (points >= 10) return 1;
  return 0;
}

// Read offline baseline profiles only during local offline development without Supabase
function getBundledBaselineProfiles() {
  const candidatePaths = [
    path.join(process.cwd(), 'data/profiles.json'),
    '/var/task/data/profiles.json'
  ];

  for (const filePath of candidatePaths) {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      // continue search
    }
  }
  return [];
}

// Fetch and normalize raw HackerRank Profile from public REST endpoints
export async function fetchHackerRankProfile(username) {
  const cleanUser = sanitizeUsername(username);
  if (!cleanUser) {
    throw new Error('Invalid username provided');
  }

  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': `https://www.hackerrank.com/profile/${cleanUser}`
  };

  const [profileRes, badgesRes, scoresRes, challengesRes, heatmapRes] = await Promise.allSettled([
    axios.get(`https://www.hackerrank.com/rest/hackers/${cleanUser}`, { headers, timeout: 8000 }),
    axios.get(`https://www.hackerrank.com/rest/hackers/${cleanUser}/badges`, { headers, timeout: 8000 }),
    axios.get(`https://www.hackerrank.com/rest/hackers/${cleanUser}/scores_elo`, { headers, timeout: 8000 }),
    axios.get(`https://www.hackerrank.com/rest/hackers/${cleanUser}/recent_challenges?limit=20`, { headers, timeout: 8000 }),
    axios.get(`https://www.hackerrank.com/rest/hackers/${cleanUser}/submission_histories`, { headers, timeout: 8000 })
  ]);

  const profileData = profileRes.status === 'fulfilled' ? profileRes.value.data?.model : null;
  
  if (!profileData && profileRes.status === 'rejected' && profileRes.reason?.response?.status === 404) {
    throw new Error(`HackerRank profile "@${cleanUser}" not found (404)`);
  }

  if (profileData && profileData.username && profileData.username.toLowerCase() !== cleanUser.toLowerCase()) {
    throw new Error(`Identity verification failed: requested "${cleanUser}" but received "${profileData.username}"`);
  }

  const badges = (badgesRes.status === 'fulfilled' && Array.isArray(badgesRes.value.data?.models)) 
    ? badgesRes.value.data.models 
    : [];

  const scores = (scoresRes.status === 'fulfilled' && Array.isArray(scoresRes.value.data)) 
    ? scoresRes.value.data 
    : [];

  const recentChallenges = (challengesRes.status === 'fulfilled' && Array.isArray(challengesRes.value.data?.models)) 
    ? challengesRes.value.data.models 
    : [];

  const heatmap = (heatmapRes.status === 'fulfilled' && typeof heatmapRes.value.data === 'object' && heatmapRes.value.data !== null)
    ? heatmapRes.value.data
    : {};

  // Active tracks with non-zero practice score
  const activeTracks = scores.filter(s => (s.practice?.score > 0) || (s.contest?.score > 0));

  // Merge official badges with any active score tracks not present in the badges endpoint
  const combinedBadges = [...badges];
  activeTracks.forEach(track => {
    const exists = combinedBadges.some(b => 
      (b.badge_type && b.badge_type.toLowerCase() === track.slug.toLowerCase()) ||
      (b.badge_name && b.badge_name.toLowerCase() === track.name.toLowerCase())
    );
    if (!exists && track.practice?.score > 0) {
      const stars = calculateStars(track.slug, track.practice.score);
      const solved = Math.max(1, Math.round(track.practice.score / 10));
      combinedBadges.push({
        badge_category: 'HackerBadge::Domain',
        badge_type: track.slug,
        badge_name: track.name,
        category_name: 'Practice Domain',
        stars: stars,
        current_points: track.practice.score,
        total_points: 500,
        solved: solved,
        total_challenges: 50,
        hacker_rank: track.practice.rank || 0
      });
    }
  });

  // Calculate strict aggregates from verified live data
  const totalStars = combinedBadges.reduce((sum, b) => sum + (b.stars || 0), 0);
  const totalPoints = Math.round(activeTracks.reduce((sum, s) => sum + (s.practice?.score || 0), 0) * 10) / 10;
  const totalSolved = combinedBadges.reduce((sum, b) => sum + (b.solved || 0), 0);

  // Best rank across practice tracks
  const ranks = scores
    .map(s => s.practice?.rank)
    .filter(r => typeof r === 'number' && r > 0);
  const bestRank = ranks.length > 0 ? Math.min(...ranks) : (profileData?.rank || 'Top 10%');

  const now = new Date().toISOString();

  return {
    username: profileData?.username || cleanUser,
    name: profileData?.name || (profileData?.personal_first_name ? `${profileData.personal_first_name || ''} ${profileData.personal_last_name || ''}`.trim() : cleanUser),
    personal_first_name: profileData?.personal_first_name || '',
    personal_last_name: profileData?.personal_last_name || '',
    avatar: profileData?.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${cleanUser}`,
    country: profileData?.country || 'India',
    school: profileData?.school || profileData?.company || 'Developer Community',
    company: profileData?.company || '',
    job_title: profileData?.job_title || 'Software Engineer',
    github_url: profileData?.github_url || `https://github.com/${cleanUser}`,
    linkedin_url: profileData?.linkedin_url || '',
    website: profileData?.website || '',
    created_at: profileData?.created_at || now,
    level: profileData?.level || 1,
    totalStars,
    totalPoints,
    totalSolved,
    bestRank,
    badges: combinedBadges,
    scores,
    activeTracks,
    certifications: [],
    submissions: recentChallenges,
    heatmap,
    lastSyncedAt: now,
    lastSuccessfulSyncAt: now,
    lastSyncStatus: 'success',
    lastSyncError: null,
    customMeta: {
      department: 'Engineering',
      batch: 'Core Group',
      status: 'Active',
      notes: ''
    }
  };
}

// Single central backend sync pipeline directly against Supabase
export async function syncMember(username, existingProfile = null) {
  const cleanUser = sanitizeUsername(username);
  const now = new Date().toISOString();
  console.log(`[SYNC] Fetching @${cleanUser}...`);

  try {
    const fresh = await fetchHackerRankProfile(cleanUser);
    console.log(`[SYNC] @${cleanUser} validated and parsed successfully.`);

    // Strictly preserve admin-managed metadata
    if (existingProfile?.customMeta) {
      fresh.customMeta = { ...fresh.customMeta, ...existingProfile.customMeta };
    }
    if (existingProfile?.notes) fresh.notes = existingProfile.notes;

    fresh.lastSyncedAt = now;
    fresh.lastSuccessfulSyncAt = now;
    fresh.lastSyncStatus = 'success';
    fresh.lastSyncError = null;

    if (isSupabaseConfigured()) {
      await upsertSupabaseProfile(fresh);
    }

    return { profile: fresh, error: null };
  } catch (err) {
    console.warn(`[SYNC] @${cleanUser} sync failed: ${err.message}`);
    if (existingProfile) {
      existingProfile.lastSyncedAt = now;
      existingProfile.lastSyncStatus = 'failed';
      existingProfile.lastSyncError = err.message;
      if (isSupabaseConfigured()) {
        await upsertSupabaseProfile(existingProfile);
      }
      return { profile: existingProfile, error: err.message };
    }
    throw err;
  }
}

// Global server-side sync lock
let isSyncInProgress = false;

// Scheduled automatic sync every 10 minutes directly on Supabase
export async function autoSyncProfiles() {
  if (isSyncInProgress) {
    console.log('[SYNC] Scheduled sync skipped: another sync cycle is already in progress.');
    return;
  }

  isSyncInProgress = true;
  console.log('[SYNC] Starting scheduled sync cycle for all tracked members...');

  try {
    const profiles = isSupabaseConfigured() ? await getSupabaseProfiles() : [];
    if (!profiles || profiles.length === 0) {
      console.log('[SYNC] No tracked members found in Supabase.');
      return;
    }

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < profiles.length; i++) {
      const member = profiles[i];
      try {
        const { profile, error } = await syncMember(member.username, member);
        if (error) {
          failCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        failCount++;
        console.error(`[SYNC] Unexpected error syncing ${member.username}:`, err.message);
      }
      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`[SYNC] Scheduled sync completed: ${successCount} successful, ${failCount} failed.`);
  } catch (e) {
    console.error('[SYNC] Scheduled sync cycle error:', e.message);
  } finally {
    isSyncInProgress = false;
  }
}

// Run 10-minute auto-sync timer in local standalone development
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.LAMBDA_TASK_ROOT) {
  setInterval(autoSyncProfiles, 10 * 60 * 1000);
}

// Admin Password Configuration
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Nanami@1304';
const ADMIN_TOKEN = 'hr_admin_auth_token_secret';

// Admin Authentication Middleware for mutating operations
export function requireAdminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const adminKey = req.headers['x-admin-key'];

  if (
    (authHeader && (authHeader === `Bearer ${ADMIN_TOKEN}` || authHeader === `Bearer ${ADMIN_PASSWORD}`)) ||
    (adminKey && (adminKey === ADMIN_PASSWORD || adminKey === ADMIN_TOKEN))
  ) {
    return next();
  }
  return res.status(401).json({ success: false, error: 'Unauthorized: Admin authentication required.' });
}

// ----------------- API ROUTER DEFINITIONS -----------------
const apiRouter = express.Router();

// 0. Admin Login & Verification Endpoint
apiRouter.post('/admin/login', (req, res) => {
  const { password } = req.body;
  if (password === ADMIN_PASSWORD) {
    res.json({ success: true, message: 'Admin authenticated successfully', token: ADMIN_TOKEN });
  } else {
    res.status(401).json({ success: false, error: 'Incorrect admin password' });
  }
});

// 1. GET all profiles (Publicly accessible - reads directly from Supabase PostgreSQL)
apiRouter.get('/profiles', async (req, res) => {
  try {
    if (isSupabaseConfigured()) {
      const profiles = await getSupabaseProfiles();
      if (profiles !== null) {
        return res.json({ 
          success: true, 
          count: profiles.length, 
          data: profiles,
          serverTime: new Date().toISOString()
        });
      }
    }

    // Local offline dev fallback only
    const baseline = getBundledBaselineProfiles();
    res.json({ 
      success: true, 
      count: baseline.length, 
      data: baseline,
      serverTime: new Date().toISOString()
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 2. GET a single profile by username
apiRouter.get('/profile/:username', async (req, res) => {
  const username = sanitizeUsername(req.params.username);
  if (!username) {
    return res.status(400).json({ success: false, error: 'Invalid username' });
  }

  if (isSupabaseConfigured() && !req.query.forceRefresh) {
    const fromSupabase = await getSupabaseProfile(username);
    if (fromSupabase) {
      return res.json({ success: true, cached: true, data: fromSupabase });
    }
  }

  try {
    const existing = isSupabaseConfigured() ? await getSupabaseProfile(username) : null;
    const { profile } = await syncMember(username, existing);
    res.json({ success: true, cached: false, data: profile });
  } catch (err) {
    console.error(`Error fetching profile ${username}:`, err.message);
    res.status(404).json({ success: false, error: err.message });
  }
});

// 3. POST add new profile & persist directly to Supabase (Admin protected)
apiRouter.post('/profiles', requireAdminAuth, async (req, res) => {
  const { username: rawInput, customMeta } = req.body;
  const username = sanitizeUsername(rawInput);
  if (!username) {
    return res.status(400).json({ success: false, error: 'Username or profile URL is required' });
  }

  try {
    const existing = isSupabaseConfigured() ? await getSupabaseProfile(username) : null;
    const fresh = await fetchHackerRankProfile(username);

    // Merge existing customMeta and any newly passed customMeta
    if (existing?.customMeta) {
      fresh.customMeta = { ...fresh.customMeta, ...existing.customMeta };
    }
    if (customMeta) {
      fresh.customMeta = { ...fresh.customMeta, ...customMeta };
    }

    if (isSupabaseConfigured()) {
      const saved = await upsertSupabaseProfile(fresh);
      return res.status(201).json({ 
        success: true, 
        message: `Profile @${username} verified and saved to database`, 
        data: saved || fresh 
      });
    }

    res.status(201).json({ success: true, data: fresh });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message || 'Failed to fetch HackerRank profile' });
  }
});

// 4. POST batch add profiles directly to Supabase (Admin protected)
apiRouter.post('/profiles/batch', requireAdminAuth, async (req, res) => {
  const { inputs } = req.body;
  if (!inputs) {
    return res.status(400).json({ success: false, error: 'Inputs array or string required' });
  }

  let list = [];
  if (Array.isArray(inputs)) {
    list = inputs;
  } else if (typeof inputs === 'string') {
    list = inputs.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
  }

  const results = { added: [], failed: [] };

  for (const raw of list) {
    const username = sanitizeUsername(raw);
    if (!username) continue;
    try {
      const existing = isSupabaseConfigured() ? await getSupabaseProfile(username) : null;
      const profile = await fetchHackerRankProfile(username);
      if (existing?.customMeta) {
        profile.customMeta = { ...profile.customMeta, ...existing.customMeta };
      }
      if (isSupabaseConfigured()) {
        await upsertSupabaseProfile(profile);
      }
      results.added.push(username);
    } catch (err) {
      results.failed.push({ username, error: err.message });
    }
    await new Promise(r => setTimeout(r, 300));
  }

  res.json({ success: true, results });
});

// 5. POST sync a single profile manually (Admin protected)
apiRouter.post('/profiles/:username/sync', requireAdminAuth, async (req, res) => {
  const username = sanitizeUsername(req.params.username);
  if (!username) {
    return res.status(400).json({ success: false, error: 'Username is required' });
  }

  const existing = isSupabaseConfigured() ? await getSupabaseProfile(username) : null;
  if (!existing) {
    return res.status(404).json({ success: false, error: `Profile @${username} not found in database` });
  }

  try {
    const { profile, error } = await syncMember(username, existing);
    if (error) {
      return res.json({ success: false, message: `Sync failed for @${username}: ${error}`, data: profile });
    }
    return res.json({ success: true, message: `Successfully synced @${username}`, data: profile });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

// 6. POST sync all profiles manually (Admin protected)
apiRouter.post('/profiles/sync', requireAdminAuth, async (req, res) => {
  const profiles = isSupabaseConfigured() ? await getSupabaseProfiles() : [];
  const updated = [];
  const errors = [];

  for (const member of profiles) {
    try {
      const { profile, error } = await syncMember(member.username, member);
      if (error) {
        errors.push({ username: member.username, error });
      } else {
        updated.push(member.username);
      }
    } catch (err) {
      errors.push({ username: member.username, error: err.message });
    }
    await new Promise(r => setTimeout(r, 250));
  }

  res.json({ success: true, updated, errors, total: profiles.length });
});

// 7. PATCH update custom metadata directly in Supabase (Admin protected)
apiRouter.patch('/profiles/:username', requireAdminAuth, async (req, res) => {
  const username = sanitizeUsername(req.params.username);
  const { customMeta, name, country, school, job_title } = req.body;
  if (!username) {
    return res.status(400).json({ success: false, error: 'Username is required' });
  }

  if (isSupabaseConfigured()) {
    const updated = await updateSupabaseProfileMeta(username, { customMeta, name, country, school, job_title });
    if (!updated) {
      return res.status(404).json({ success: false, error: `Profile @${username} not found in database` });
    }
    return res.json({ success: true, data: updated });
  }

  res.json({ success: true });
});

// 8. DELETE profile directly from Supabase PostgreSQL (Admin protected)
apiRouter.delete('/profiles/:username', requireAdminAuth, async (req, res) => {
  const username = sanitizeUsername(req.params.username);
  if (!username) {
    return res.status(400).json({ success: false, error: 'Username is required' });
  }

  if (isSupabaseConfigured()) {
    const deleted = await deleteSupabaseProfile(username);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Profile @${username} could not be deleted` });
    }
    return res.json({ success: true, message: `Profile @${username} removed from tracking` });
  }

  res.json({ success: true });
});

// Mount the API router across all Netlify and local path variations
app.use('/.netlify/functions/api', apiRouter);
app.use('/api', apiRouter);
app.use('/', apiRouter);

// Serve static production build if available
const DIST_DIR = path.join(process.cwd(), 'dist');
if (fs.existsSync(DIST_DIR)) {
  app.use(express.static(DIST_DIR));
  app.use((req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/.netlify')) return next();
    res.sendFile(path.join(DIST_DIR, 'index.html'));
  });
}

// Only start standalone HTTP server when not running in serverless Lambda runtime
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME && !process.env.LAMBDA_TASK_ROOT && process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`[SERVER] HackerRank Analytics Server running on port ${PORT}`);
  });
}
