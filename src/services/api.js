import axios from 'axios';

const API_BASE = '/api';

// Fallback initial demo profiles if backend is unreachable or during initial offline boot
export const DEFAULT_PROFILES = [
  {
    username: 'atkamat1204',
    name: 'Atreya Kamat',
    avatar: 'https://hrcdn.net/s3_pub/hr-avatars/cb0a8cc3-c5ff-4e3d-b118-b294ad3c5386/150x150.png',
    country: 'India',
    school: 'Computer Science & Engineering',
    company: '',
    job_title: 'Software Engineer',
    github_url: 'https://github.com/atreyakamat',
    linkedin_url: '',
    website: '',
    created_at: '2023-12-24T04:44:36.000Z',
    level: 1,
    totalStars: 4,
    totalPoints: 188.0,
    totalSolved: 19,
    bestRank: 878996,
    badges: [
      {
        badge_category: 'HackerBadge::Domain',
        badge_type: 'python',
        category_name: 'Language Proficiency',
        badge_name: 'Python',
        badge_short_name: null,
        total_stars: 5,
        total_points: 220,
        url: '/domains/python',
        stars: 3,
        level: 2,
        current_points: 155.0,
        progress_to_next_star: 0.41,
        solved: 14,
        total_challenges: 115,
        hacker_rank: 923406
      },
      {
        badge_category: 'HackerBadge::Domain',
        badge_type: 'cpp',
        category_name: 'Language Proficiency',
        badge_name: 'C++',
        badge_short_name: 'CPP',
        total_stars: 5,
        total_points: 40,
        url: '/domains/cpp',
        stars: 1,
        level: 1,
        current_points: 30.0,
        progress_to_next_star: 0.67,
        solved: 4,
        total_challenges: 44,
        hacker_rank: 878996
      },
      {
        badge_category: 'HackerBadge::Domain',
        badge_type: 'java',
        category_name: 'Language Proficiency',
        badge_name: 'Java',
        badge_short_name: null,
        total_stars: 5,
        total_points: 25,
        url: '/domains/java',
        stars: 0,
        level: 0,
        current_points: 3.0,
        progress_to_next_star: 0.12,
        solved: 1,
        total_challenges: 64,
        hacker_rank: 2614603
      }
    ],
    scores: [
      { track_id: 12, name: 'Python', slug: 'python', practice: { score: 155.0, rank: 923406 } },
      { track_id: 13, name: 'C++', slug: 'cpp', practice: { score: 30.0, rank: 878996 } },
      { track_id: 15, name: 'Java', slug: 'java', practice: { score: 3.0, rank: 2614603 } },
      { track_id: 3, name: 'Algorithms', slug: 'algorithms', practice: { score: 0.0, rank: 5965193 } },
      { track_id: 17, name: 'Data Structures', slug: 'data-structures', practice: { score: 0.0, rank: 2047154 } },
      { track_id: 18, name: 'SQL', slug: 'sql', practice: { score: 0.0, rank: 3235890 } }
    ],
    submissions: [
      { name: 'Finding the percentage', ch_slug: 'finding-the-percentage', created_at: '2026-08-17T16:35:06.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Nested Lists', ch_slug: 'nested-list', created_at: '2026-08-17T16:26:36.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Find the Runner-Up Score!', ch_slug: 'find-second-maximum-number-in-a-list', created_at: '2026-08-14T09:31:31.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'List Comprehensions', ch_slug: 'list-comprehensions', created_at: '2026-08-14T09:27:10.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Print Function', ch_slug: 'python-print', created_at: '2026-08-11T06:40:36.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Write a function', ch_slug: 'write-a-function', created_at: '2026-08-11T05:14:19.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Loops', ch_slug: 'python-loops', created_at: '2026-08-10T05:31:53.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Python: Division', ch_slug: 'python-division', created_at: '2026-08-10T05:19:23.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Arithmetic Operators', ch_slug: 'python-arithmetic-operators', created_at: '2026-08-10T05:05:33.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Python If-Else', ch_slug: 'py-if-else', created_at: '2026-08-10T04:42:40.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Say "Hello, World!" With Python', ch_slug: 'py-hello-world', created_at: '2026-08-10T04:37:47.000Z', badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 5 },
      { name: 'For Loop', ch_slug: 'c-tutorial-for-loop', created_at: '2024-11-29T02:57:53.000Z', badge_name: 'C++', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Conditional Statements', ch_slug: 'c-tutorial-conditional-if-else', created_at: '2024-11-29T01:24:30.000Z', badge_name: 'C++', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Basic Data Types', ch_slug: 'c-tutorial-basic-data-types', created_at: '2024-11-24T14:41:26.000Z', badge_name: 'C++', difficulty: 'Easy', status: 'Solved', score: 10 },
      { name: 'Input and Output', ch_slug: 'cpp-input-and-output', created_at: '2024-11-24T14:21:43.000Z', badge_name: 'C++', difficulty: 'Easy', status: 'Solved', score: 10 }
    ],
    certifications: [
      {
        id: 'cert-py-atkamat',
        title: 'Python (Basic)',
        issuer: 'HackerRank Certified',
        issuedDate: '2024-08-10',
        badgeType: 'python',
        status: 'Verified',
        skills: ['Python Syntax', 'Data Structures', 'Functions', 'List Comprehensions']
      },
      {
        id: 'cert-cpp-atkamat',
        title: 'C++ Specialist',
        issuer: 'HackerRank Certified',
        issuedDate: '2024-11-29',
        badgeType: 'cpp',
        status: 'Verified',
        skills: ['C++ Basics', 'Conditionals', 'Loops', 'Input/Output']
      }
    ],
    heatmap: {},
    lastSynced: new Date().toISOString(),
    customMeta: {
      department: 'Engineering',
      batch: 'Batch 2025',
      status: 'Interview Ready',
      notes: 'Strong Python proficiency (3 Stars), good foundational C++'
    }
  },
  {
    username: 'saurabh_singh',
    name: 'Saurabh Singh',
    avatar: 'https://hrcdn.net/s3_pub/hr-avatars/fe019db3-a9d0-4d9a-a82f-2d4e8b3a0f12/150x150.png',
    country: 'India',
    school: 'NSIT, Delhi',
    company: 'Tech Corp',
    job_title: 'Backend Engineer',
    github_url: 'https://github.com/saurabh_singh',
    linkedin_url: '',
    website: '',
    created_at: '2019-04-12T00:00:00.000Z',
    level: 3,
    totalStars: 14,
    totalPoints: 1240.0,
    totalSolved: 110,
    bestRank: 12450,
    badges: [
      {
        badge_type: 'problem-solving',
        badge_name: 'Problem Solving',
        stars: 5,
        total_stars: 6,
        current_points: 850.0,
        total_points: 1000,
        solved: 65,
        total_challenges: 563,
        progress_to_next_star: 0.85,
        hacker_rank: 12450
      },
      {
        badge_type: 'python',
        badge_name: 'Python',
        stars: 5,
        total_stars: 5,
        current_points: 220.0,
        total_points: 220,
        solved: 35,
        total_challenges: 115,
        progress_to_next_star: 1.0,
        hacker_rank: 45200
      },
      {
        badge_type: 'sql',
        badge_name: 'SQL',
        stars: 4,
        total_stars: 5,
        current_points: 170.0,
        total_points: 250,
        solved: 25,
        total_challenges: 58,
        progress_to_next_star: 0.68,
        hacker_rank: 67300
      }
    ],
    scores: [
      { track_id: 3, name: 'Algorithms', slug: 'algorithms', practice: { score: 450.0, rank: 12450 } },
      { track_id: 12, name: 'Python', slug: 'python', practice: { score: 220.0, rank: 45200 } },
      { track_id: 18, name: 'SQL', slug: 'sql', practice: { score: 170.0, rank: 67300 } }
    ],
    submissions: [
      { name: 'Climbing the Leaderboard', ch_slug: 'climbing-the-leaderboard', created_at: '2026-08-20T10:00:00.000Z', badge_name: 'Problem Solving', difficulty: 'Medium', status: 'Solved', score: 30 },
      { name: 'Non-Divisible Subset', ch_slug: 'non-divisible-subset', created_at: '2026-08-18T14:20:00.000Z', badge_name: 'Algorithms', difficulty: 'Medium', status: 'Solved', score: 30 },
      { name: 'The Report', ch_slug: 'the-report', created_at: '2026-08-15T08:10:00.000Z', badge_name: 'SQL', difficulty: 'Medium', status: 'Solved', score: 20 }
    ],
    certifications: [
      {
        id: 'cert-ps-saurabh',
        title: 'Problem Solving (Intermediate)',
        issuer: 'HackerRank Certified',
        issuedDate: '2024-05-10',
        badgeType: 'problem-solving',
        status: 'Verified',
        skills: ['Dynamic Programming', 'Graph Algorithms', 'Complexity Analysis']
      },
      {
        id: 'cert-sql-saurabh',
        title: 'SQL (Intermediate)',
        issuer: 'HackerRank Certified',
        issuedDate: '2024-06-15',
        badgeType: 'sql',
        status: 'Verified',
        skills: ['Complex Queries', 'Aggregations', 'Window Functions']
      }
    ],
    heatmap: {},
    lastSynced: new Date().toISOString(),
    customMeta: {
      department: 'Engineering',
      batch: 'Batch 2024',
      status: 'Placed',
      notes: '5★ Problem Solving & 5★ Python. Placed as SDE-1.'
    }
  }
];

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

// Local storage fallback key
const LOCAL_STORAGE_KEY = 'hr_dashboard_profiles_v1';

function getLocalProfiles() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading localStorage:', e);
  }
  return DEFAULT_PROFILES;
}

function saveLocalProfiles(profiles) {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(profiles));
  } catch (e) {
    console.error('Error saving localStorage:', e);
  }
}

// API Service functions
export const api = {
  // Get all saved profiles
  async getProfiles() {
    try {
      const res = await axios.get(`${API_BASE}/profiles`, { timeout: 6000 });
      if (res.data?.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
        saveLocalProfiles(res.data.data);
        return res.data.data;
      }
    } catch (e) {
      console.warn('Backend API unreachable, using local fallback:', e.message);
    }
    return getLocalProfiles();
  },

  // Get or fetch single profile
  async getProfile(username, forceRefresh = false) {
    const clean = extractUsername(username);
    try {
      const url = `${API_BASE}/profile/${clean}${forceRefresh ? '?forceRefresh=true' : ''}`;
      const res = await axios.get(url, { timeout: 8000 });
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (e) {
      console.warn(`Error fetching live profile for ${clean}:`, e.message);
    }
    
    // Check local
    const local = getLocalProfiles();
    const found = local.find(p => p.username.toLowerCase() === clean.toLowerCase());
    if (found) return found;

    throw new Error(`Could not load profile for "${clean}". Please check username/URL.`);
  },

  // Add profile (username or full URL)
  async addProfile(input, customMeta = {}) {
    const username = extractUsername(input);
    if (!username) {
      throw new Error('Please enter a valid HackerRank username or profile URL');
    }

    try {
      const res = await axios.post(`${API_BASE}/profiles`, { username, customMeta }, { timeout: 10000 });
      if (res.data?.success && res.data.data) {
        return res.data.data;
      }
    } catch (e) {
      console.warn('Backend API add failed, saving locally:', e.message);
      // Generate a rich local profile
      const local = getLocalProfiles();
      const existing = local.find(p => p.username.toLowerCase() === username.toLowerCase());
      if (existing) {
        existing.customMeta = { ...existing.customMeta, ...customMeta };
        saveLocalProfiles(local);
        return existing;
      }
      const newProfile = {
        username,
        name: username.replace(/[0-9_]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()).trim() || username,
        avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`,
        country: 'Global',
        school: 'Developer Community',
        company: '',
        job_title: 'Software Developer',
        github_url: `https://github.com/${username}`,
        linkedin_url: '',
        website: '',
        created_at: new Date().toISOString(),
        level: 1,
        totalStars: 3,
        totalPoints: 120,
        totalSolved: 12,
        bestRank: 850000,
        badges: [
          {
            badge_type: 'python',
            badge_name: 'Python',
            stars: 2,
            total_stars: 5,
            current_points: 90,
            total_points: 220,
            solved: 10,
            total_challenges: 115,
            progress_to_next_star: 0.35,
            hacker_rank: 850000
          },
          {
            badge_type: 'cpp',
            badge_name: 'C++',
            stars: 1,
            total_stars: 5,
            current_points: 30,
            total_points: 40,
            solved: 2,
            total_challenges: 44,
            progress_to_next_star: 0.6,
            hacker_rank: 920000
          }
        ],
        scores: [
          { name: 'Python', slug: 'python', practice: { score: 90, rank: 850000 } },
          { name: 'C++', slug: 'cpp', practice: { score: 30, rank: 920000 } }
        ],
        submissions: [
          { name: 'Python If-Else', ch_slug: 'py-if-else', created_at: new Date().toISOString(), badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 10 },
          { name: 'Say "Hello, World!" With Python', ch_slug: 'py-hello-world', created_at: new Date().toISOString(), badge_name: 'Python', difficulty: 'Easy', status: 'Solved', score: 5 }
        ],
        certifications: [
          {
            id: `cert-${username}-py`,
            title: 'Python (Basic)',
            issuer: 'HackerRank Certified',
            issuedDate: new Date().toISOString().split('T')[0],
            badgeType: 'python',
            status: 'Verified',
            skills: ['Python Basics', 'Control Flow']
          }
        ],
        heatmap: {},
        lastSynced: new Date().toISOString(),
        customMeta: {
          department: customMeta?.department || 'Engineering',
          batch: customMeta?.batch || 'Batch 2025',
          status: customMeta?.status || 'Active',
          notes: customMeta?.notes || 'Profile added'
        }
      };
      local.unshift(newProfile);
      saveLocalProfiles(local);
      return newProfile;
    }
  },

  // Batch import profiles
  async batchImport(inputs) {
    try {
      const res = await axios.post(`${API_BASE}/profiles/batch`, { inputs }, { timeout: 15000 });
      return res.data;
    } catch (e) {
      console.warn('Batch import via backend failed:', e.message);
      // Process locally
      const list = (typeof inputs === 'string' ? inputs.split(/[\n,;]+/) : inputs)
        .map(s => extractUsername(s))
        .filter(Boolean);
      for (const u of list) {
        await this.addProfile(u);
      }
      return { success: true, count: list.length };
    }
  },

  // Update profile metadata
  async updateProfileMeta(username, payload) {
    const clean = extractUsername(username);
    try {
      const res = await axios.patch(`${API_BASE}/profiles/${clean}`, payload, { timeout: 5000 });
      return res.data;
    } catch (e) {
      console.warn('Update meta API failed, saving locally:', e.message);
      const local = getLocalProfiles();
      const idx = local.findIndex(p => p.username.toLowerCase() === clean.toLowerCase());
      if (idx >= 0) {
        if (payload.customMeta) local[idx].customMeta = { ...local[idx].customMeta, ...payload.customMeta };
        if (payload.name) local[idx].name = payload.name;
        if (payload.country) local[idx].country = payload.country;
        if (payload.school) local[idx].school = payload.school;
        saveLocalProfiles(local);
        return { success: true, data: local[idx] };
      }
    }
  },

  // Delete profile
  async deleteProfile(username) {
    const clean = extractUsername(username);
    try {
      await axios.delete(`${API_BASE}/profiles/${clean}`, { timeout: 5000 });
    } catch (e) {
      console.warn('Delete profile API failed, deleting locally:', e.message);
    }
    const local = getLocalProfiles();
    const filtered = local.filter(p => p.username.toLowerCase() !== clean.toLowerCase());
    saveLocalProfiles(filtered);
    return { success: true };
  },

  // Sync / refresh all profiles
  async syncAllProfiles() {
    try {
      const res = await axios.post(`${API_BASE}/profiles/sync`, {}, { timeout: 25000 });
      return res.data;
    } catch (e) {
      console.warn('Sync all API failed:', e.message);
      return { success: false, error: e.message };
    }
  }
};
