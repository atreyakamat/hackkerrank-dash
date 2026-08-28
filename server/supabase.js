import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL || '';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

let supabase = null;

if (SUPABASE_URL && SUPABASE_KEY) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false }
    });
    console.log('[SUPABASE] Connected to Supabase Project:', SUPABASE_URL);
  } catch (e) {
    console.warn('[SUPABASE] Connection initialization error:', e.message);
  }
}

export function isSupabaseConfigured() {
  return Boolean(supabase);
}

export function getClient() {
  return supabase;
}

// Convert snake_case DB row from Supabase to camelCase App Model
export function rowToProfile(row) {
  if (!row) return null;
  return {
    username: row.username,
    name: row.name || row.username,
    personal_first_name: row.personal_first_name || '',
    personal_last_name: row.personal_last_name || '',
    avatar: row.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${row.username}`,
    country: row.country || 'India',
    school: row.school || '',
    company: row.company || '',
    job_title: row.job_title || '',
    github_url: row.github_url || '',
    linkedin_url: row.linkedin_url || '',
    website: row.website || '',
    created_at: row.created_at,
    level: row.level || 1,
    totalSolved: row.total_solved ?? 0,
    totalStars: row.total_stars ?? 0,
    totalPoints: Number(row.total_points ?? 0),
    bestRank: row.best_rank || 'Top 10%',
    badges: Array.isArray(row.badges) ? row.badges : [],
    scores: Array.isArray(row.scores) ? row.scores : [],
    activeTracks: Array.isArray(row.active_tracks) ? row.active_tracks : [],
    submissions: Array.isArray(row.submissions) ? row.submissions : [],
    heatmap: (row.heatmap && typeof row.heatmap === 'object') ? row.heatmap : {},
    lastSyncedAt: row.last_synced_at,
    lastSuccessfulSyncAt: row.last_successful_sync_at,
    lastSyncStatus: row.last_sync_status || 'success',
    lastSyncError: row.last_sync_error,
    customMeta: row.custom_meta || { department: 'Engineering', batch: 'Core Group', status: 'Active', notes: '' }
  };
}

// Convert camelCase App Model to snake_case DB row for Supabase
export function profileToRow(p) {
  return {
    username: p.username,
    name: p.name || p.username,
    personal_first_name: p.personal_first_name || '',
    personal_last_name: p.personal_last_name || '',
    avatar: p.avatar,
    country: p.country || 'India',
    school: p.school || '',
    company: p.company || '',
    job_title: p.job_title || '',
    github_url: p.github_url || '',
    linkedin_url: p.linkedin_url || '',
    website: p.website || '',
    total_solved: p.totalSolved ?? 0,
    total_stars: p.totalStars ?? 0,
    total_points: p.totalPoints ?? 0,
    best_rank: String(p.bestRank || ''),
    badges: p.badges || [],
    scores: p.scores || [],
    active_tracks: p.activeTracks || [],
    submissions: p.submissions || [],
    heatmap: p.heatmap || {},
    last_synced_at: p.lastSyncedAt || new Date().toISOString(),
    last_successful_sync_at: p.lastSuccessfulSyncAt || new Date().toISOString(),
    last_sync_status: p.lastSyncStatus || 'success',
    last_sync_error: p.lastSyncError || null,
    custom_meta: p.customMeta || { department: 'Engineering', batch: 'Core Group', status: 'Active', notes: '' }
  };
}

// Read all profiles from Supabase PostgreSQL
export async function getSupabaseProfiles() {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('tracked_profiles')
      .select('*')
      .order('total_solved', { ascending: false });

    if (error) {
      console.warn('[SUPABASE] Read error:', error.message);
      return null;
    }

    if (Array.isArray(data)) {
      return data.map(rowToProfile);
    }
    return [];
  } catch (e) {
    console.warn('[SUPABASE] Exception reading profiles:', e.message);
    return null;
  }
}

// Read single profile from Supabase
export async function getSupabaseProfile(username) {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('tracked_profiles')
      .select('*')
      .eq('username', username)
      .single();

    if (error || !data) return null;
    return rowToProfile(data);
  } catch {
    return null;
  }
}

// Upsert a single profile into Supabase
export async function upsertSupabaseProfile(profile) {
  if (!supabase) return null;
  const row = profileToRow(profile);
  try {
    const { data, error } = await supabase
      .from('tracked_profiles')
      .upsert(row, { onConflict: 'username' })
      .select()
      .single();

    if (error) throw error;
    return rowToProfile(data);
  } catch (e) {
    console.warn(`[SUPABASE] Error upserting @${profile.username}:`, e.message);
    return null;
  }
}

// Update profile metadata in Supabase
export async function updateSupabaseProfileMeta(username, payload) {
  if (!supabase) return null;
  try {
    const updateData = { updated_at: new Date().toISOString() };
    if (payload.customMeta) updateData.custom_meta = payload.customMeta;
    if (payload.name) updateData.name = payload.name;
    if (payload.country) updateData.country = payload.country;
    if (payload.school) updateData.school = payload.school;
    if (payload.job_title) updateData.job_title = payload.job_title;

    const { data, error } = await supabase
      .from('tracked_profiles')
      .update(updateData)
      .eq('username', username)
      .select()
      .single();

    if (error) throw error;
    return rowToProfile(data);
  } catch (e) {
    console.warn(`[SUPABASE] Error updating meta for @${username}:`, e.message);
    return null;
  }
}

// Delete a profile from Supabase PostgreSQL
export async function deleteSupabaseProfile(username) {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('tracked_profiles')
      .delete()
      .eq('username', username);

    if (error) throw error;
    console.log(`[SUPABASE] Deleted @${username} from Supabase PostgreSQL.`);
    return true;
  } catch (e) {
    console.warn(`[SUPABASE] Error deleting @${username}:`, e.message);
    return false;
  }
}

// Migrate verified local records to Supabase PostgreSQL
export async function migrateLocalDataToSupabase(localProfiles = []) {
  if (!supabase || !Array.isArray(localProfiles) || localProfiles.length === 0) return;
  console.log(`[SUPABASE] Migrating ${localProfiles.length} verified records to Supabase...`);
  const rows = localProfiles.map(profileToRow);
  try {
    const { data, error } = await supabase
      .from('tracked_profiles')
      .upsert(rows, { onConflict: 'username' });

    if (error) {
      console.warn('[SUPABASE] Migration error:', error.message);
    } else {
      console.log(`[SUPABASE] Successfully persisted ${rows.length} profiles to Supabase PostgreSQL!`);
    }
  } catch (e) {
    console.warn('[SUPABASE] Migration exception:', e.message);
  }
}
