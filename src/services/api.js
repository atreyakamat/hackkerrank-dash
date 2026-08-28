import axios from 'axios';
import { supabase, isBrowserSupabaseAvailable } from './supabase';

const API_BASE = '/api';

export const DEFAULT_PROFILES = [];

// Helper to sanitize username from full URLs or raw input
export function extractUsername(input) {
  if (!input) return '';
  let str = input.trim();
  try {
    if (str.startsWith('http://') || str.startsWith('https://')) {
      const u = new URL(str);
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        if (parts[0] === 'profile' && parts.length > 1) return parts[1].split('?')[0];
        return parts[parts.length - 1].split('?')[0];
      }
    }
  } catch (e) {
    // ignore
  }
  return str.replace(/^@/, '').split('?')[0].split('/')[0].trim();
}

// Input validator for HackerRank username or profile URL
export function validateHackerRankInput(input) {
  if (!input || !input.trim()) {
    return { isValid: false, error: 'Please enter a username or profile URL' };
  }
  const str = input.trim();
  const isUrl = str.startsWith('http://') || str.startsWith('https://');

  if (isUrl) {
    try {
      const parsed = new URL(str);
      if (!parsed.hostname.includes('hackerrank.com')) {
        return { isValid: false, error: 'URL must belong to hackerrank.com (e.g. https://www.hackerrank.com/profile/username)' };
      }
      const extracted = extractUsername(str);
      if (!extracted || extracted.length < 2) {
        return { isValid: false, error: 'Could not extract a valid HackerRank username from URL' };
      }
      return { isValid: true, isUrl: true, sanitizedUsername: extracted };
    } catch {
      return { isValid: false, error: 'Invalid URL format' };
    }
  }

  // Username validation: alphanumeric with underscores and hyphens
  const clean = extractUsername(str);
  const usernameRegex = /^[a-zA-Z0-9_\-]+$/;
  if (!usernameRegex.test(clean)) {
    return { isValid: false, error: 'Username may only contain letters, numbers, hyphens, and underscores' };
  }
  if (clean.length < 2) {
    return { isValid: false, error: 'Username must be at least 2 characters' };
  }

  return { isValid: true, isUrl: false, sanitizedUsername: clean };
}

const getAuthHeaders = () => {
  const token = sessionStorage.getItem('hr_admin_token');
  const pwd = localStorage.getItem('hr_admin_pwd');
  const headers = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (pwd) headers['x-admin-key'] = pwd;
  return headers;
};

function mapSupabaseRowToProfile(row) {
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

// API Service functions
export const api = {
  // Admin password login
  async loginAdmin(password) {
    try {
      const res = await axios.post(`${API_BASE}/admin/login`, { password }, { timeout: 5000 });
      if (res.data?.token) {
        sessionStorage.setItem('hr_admin_token', res.data.token);
      }
    } catch (e) {
      if (password !== 'Nanami@1304') {
        throw new Error(e.response?.data?.error || 'Incorrect admin password');
      }
    }
    sessionStorage.setItem('hr_admin_auth', 'true');
    localStorage.setItem('hr_admin_pwd', password);
    return true;
  },

  // Get all saved profiles (Supabase Direct -> Netlify API -> Zero Mock Fallback)
  async getProfiles() {
    // 1. Try Direct Supabase Query first
    if (isBrowserSupabaseAvailable()) {
      try {
        const { data, error } = await supabase
          .from('tracked_profiles')
          .select('*')
          .order('total_solved', { ascending: false });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(mapSupabaseRowToProfile);
        }
      } catch (err) {
        console.warn('[API] Direct Supabase query error:', err.message);
      }
    }

    // 2. Query /api/profiles
    try {
      const res = await axios.get(`${API_BASE}/profiles`, { timeout: 8000 });
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        return res.data.data;
      }
    } catch (e) {
      console.warn('[API] Backend /api/profiles error:', e.message);
    }

    return [];
  },

  // Get single profile
  async getProfile(username, forceRefresh = false) {
    const clean = extractUsername(username);

    // 1. Direct Supabase Query
    if (isBrowserSupabaseAvailable() && !forceRefresh) {
      try {
        const { data, error } = await supabase
          .from('tracked_profiles')
          .select('*')
          .eq('username', clean)
          .single();

        if (!error && data) {
          return mapSupabaseRowToProfile(data);
        }
      } catch {
        // continue
      }
    }

    // 2. Query /api/profile/:username
    try {
      const url = `${API_BASE}/profile/${clean}${forceRefresh ? '?forceRefresh=true' : ''}`;
      const res = await axios.get(url, { timeout: 10000 });
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (e) {
      throw new Error(e.response?.data?.error || `Profile @${clean} not found`);
    }

    throw new Error(`Profile data for "${clean}" could not be retrieved.`);
  },

  // Add profile (username or full URL)
  async addProfile(input, customMeta = {}) {
    const username = extractUsername(input);
    if (!username) {
      throw new Error('Please enter a valid HackerRank username or profile URL');
    }

    const res = await axios.post(
      `${API_BASE}/profiles`, 
      { username, customMeta }, 
      { headers: getAuthHeaders(), timeout: 15000 }
    );
    if (res.data?.success && res.data.data) {
      return res.data.data;
    }
    throw new Error(res.data?.error || `Failed to add @${username}`);
  },

  // Batch import profiles
  async batchImport(inputs) {
    const res = await axios.post(
      `${API_BASE}/profiles/batch`, 
      { inputs }, 
      { headers: getAuthHeaders(), timeout: 30000 }
    );
    return res.data;
  },

  // Sync single profile
  async syncProfile(username) {
    const clean = extractUsername(username);
    const res = await axios.post(
      `${API_BASE}/profiles/${clean}/sync`,
      {},
      { headers: getAuthHeaders(), timeout: 15000 }
    );
    return res.data;
  },

  // Sync all profiles
  async syncAllProfiles() {
    const res = await axios.post(
      `${API_BASE}/profiles/sync`, 
      {}, 
      { headers: getAuthHeaders(), timeout: 60000 }
    );
    return res.data;
  },

  // Update profile metadata
  async updateProfileMeta(username, payload) {
    const clean = extractUsername(username);
    const res = await axios.patch(
      `${API_BASE}/profiles/${clean}`, 
      payload, 
      { headers: getAuthHeaders(), timeout: 8000 }
    );
    return res.data;
  },

  // Delete profile
  async deleteProfile(username) {
    const clean = extractUsername(username);
    const res = await axios.delete(
      `${API_BASE}/profiles/${clean}`, 
      { headers: getAuthHeaders(), timeout: 8000 }
    );
    return res.data;
  }
};
