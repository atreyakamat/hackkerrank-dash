// Supabase Edge Function: sync-hackerrank
// Runs on Deno serverless edge runtime. Compatible with Supabase Cron and manual triggers.

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

function calculateStars(slug: string, points: number): number {
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

async function fetchHackerRankProfile(cleanUser: string) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
    'Accept': 'application/json',
    'Referer': `https://www.hackerrank.com/profile/${cleanUser}`
  };

  const fetchWithTimeout = (url: string) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), 8000);
    return fetch(url, { headers, signal: controller.signal })
      .then(res => res.ok ? res.json() : null)
      .catch(() => null)
      .finally(() => clearTimeout(id));
  };

  const [profileDataRes, badgesRes, scoresRes, challengesRes, heatmapRes] = await Promise.all([
    fetchWithTimeout(`https://www.hackerrank.com/rest/hackers/${cleanUser}`),
    fetchWithTimeout(`https://www.hackerrank.com/rest/hackers/${cleanUser}/badges`),
    fetchWithTimeout(`https://www.hackerrank.com/rest/hackers/${cleanUser}/scores_elo`),
    fetchWithTimeout(`https://www.hackerrank.com/rest/hackers/${cleanUser}/recent_challenges?limit=20`),
    fetchWithTimeout(`https://www.hackerrank.com/rest/hackers/${cleanUser}/submission_histories`)
  ]);

  const profileData = profileDataRes?.model || null;
  const badges = Array.isArray(badgesRes?.models) ? badgesRes.models : [];
  const scores = Array.isArray(scoresRes) ? scoresRes : [];
  const recentChallenges = Array.isArray(challengesRes?.models) ? challengesRes.models : [];
  const heatmap = (heatmapRes && typeof heatmapRes === 'object') ? heatmapRes : {};

  // Active practice tracks
  const activeTracks = scores.filter((s: any) => (s.practice?.score > 0) || (s.contest?.score > 0));

  // Merge badges with active scores
  const combinedBadges = [...badges];
  activeTracks.forEach((track: any) => {
    const exists = combinedBadges.some((b: any) => 
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
        stars,
        current_points: track.practice.score,
        total_points: 500,
        solved,
        hacker_rank: track.practice.rank || 0
      });
    }
  });

  const totalStars = combinedBadges.reduce((sum: number, b: any) => sum + (b.stars || 0), 0);
  const totalPoints = Math.round(activeTracks.reduce((sum: number, s: any) => sum + (s.practice?.score || 0), 0) * 10) / 10;
  const totalSolved = combinedBadges.reduce((sum: number, b: any) => sum + (b.solved || 0), 0);

  const ranks = scores
    .map((s: any) => s.practice?.rank)
    .filter((r: any) => typeof r === 'number' && r > 0);
  const bestRank = ranks.length > 0 ? String(Math.min(...ranks)) : (profileData?.rank || 'Top 10%');

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
    total_solved: totalSolved,
    total_stars: totalStars,
    total_points: totalPoints,
    best_rank: bestRank,
    badges: combinedBadges,
    scores,
    active_tracks: activeTracks,
    submissions: recentChallenges,
    heatmap,
    last_synced_at: now,
    last_successful_sync_at: now,
    last_sync_status: 'success',
    last_sync_error: null
  };
}

Deno.serve(async (req) => {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Check if body has a single username requested
    let targetUser: string | null = null;
    try {
      const body = await req.json();
      targetUser = body?.username || null;
    } catch {
      // empty body means sync all
    }

    if (targetUser) {
      console.log(`[EDGE-SYNC] Syncing individual user: @${targetUser}`);
      const fresh = await fetchHackerRankProfile(targetUser);
      
      const { data, error } = await supabase
        .from('tracked_profiles')
        .upsert(fresh, { onConflict: 'username' })
        .select()
        .single();

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, member: data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Otherwise sync all members in tracked_profiles
    console.log('[EDGE-SYNC] Starting full sync for all tracked members...');
    const { data: members, error: fetchErr } = await supabase
      .from('tracked_profiles')
      .select('username, custom_meta');

    if (fetchErr) throw fetchErr;

    const results = { updated: [], failed: [] };

    for (const member of (members || [])) {
      try {
        const fresh = await fetchHackerRankProfile(member.username);
        if (member.custom_meta) {
          (fresh as any).custom_meta = member.custom_meta;
        }

        await supabase
          .from('tracked_profiles')
          .upsert(fresh, { onConflict: 'username' });

        results.updated.push(member.username as never);
      } catch (err: any) {
        results.failed.push({ username: member.username, error: err.message } as never);
      }
      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`[EDGE-SYNC] Full sync complete: ${results.updated.length} updated, ${results.failed.length} failed.`);

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
