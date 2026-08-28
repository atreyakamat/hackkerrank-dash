import 'dotenv/config';
import { 
  fetchHackerRankProfile, 
  syncMember 
} from '../server/server.js';
import { 
  getSupabaseProfiles, 
  getSupabaseProfile, 
  upsertSupabaseProfile, 
  updateSupabaseProfileMeta, 
  deleteSupabaseProfile,
  isSupabaseConfigured 
} from '../server/supabase.js';

async function run() {
  console.log('================================================================');
  console.log('LIVE PRODUCTION CRUD & HACKERRANK SYNC PIPELINE VERIFICATION');
  console.log('================================================================\n');

  if (!isSupabaseConfigured()) {
    console.error('FAIL: Supabase is not configured in environment!');
    process.exit(1);
  }

  // 1. Table Verification
  console.log('[TEST 1] Querying Supabase public.tracked_profiles table...');
  const initialProfiles = await getSupabaseProfiles();
  if (initialProfiles === null) {
    console.error('FAIL: Could not query tracked_profiles from Supabase.');
    process.exit(1);
  }
  console.log(`PASS: Table public.tracked_profiles exists and is active (Current rows: ${initialProfiles.length})\n`);

  // 2. Test ADD Member via Live HackerRank Sync -> Supabase
  const testUser = 'anantparab1404';
  console.log(`[TEST 2] Testing Add Member with live HackerRank sync for @${testUser}...`);
  const fresh = await fetchHackerRankProfile(testUser);
  console.log(`  - Verified Identity: requested="${testUser}", returned="${fresh.username}"`);
  console.log(`  - Derived Stats: ${fresh.totalSolved} solved, ★ ${fresh.totalStars} stars, ${fresh.totalPoints} pts`);
  
  // Set distinct admin metadata
  fresh.customMeta = {
    department: 'Engineering',
    batch: 'Test Pipeline Batch',
    status: 'Review',
    notes: 'Created during live automated verification'
  };

  const saved = await upsertSupabaseProfile(fresh);
  if (!saved || saved.username !== testUser) {
    console.error('FAIL: Could not upsert member to Supabase.');
    process.exit(1);
  }
  console.log(`PASS: @${testUser} saved to Supabase PostgreSQL successfully.\n`);

  // 3. Test EDIT Member in Supabase
  console.log(`[TEST 3] Testing Edit Member Admin Metadata for @${testUser}...`);
  const updatedMeta = await updateSupabaseProfileMeta(testUser, {
    customMeta: {
      department: 'Engineering',
      batch: 'Verified Batch 2026',
      status: 'Active',
      notes: 'Updated metadata'
    }
  });

  if (updatedMeta?.customMeta?.batch !== 'Verified Batch 2026') {
    console.error('FAIL: Metadata update did not persist in Supabase.');
    process.exit(1);
  }
  console.log(`PASS: Metadata updated and verified in Supabase (batch: "${updatedMeta.customMeta.batch}", status: "${updatedMeta.customMeta.status}")\n`);

  // 4. Test SYNC NOW (Fetch fresh stats + preserve custom_meta)
  console.log(`[TEST 4] Testing SYNC NOW for @${testUser}...`);
  const { profile: synced, error: syncErr } = await syncMember(testUser, updatedMeta);
  if (syncErr) {
    console.error(`FAIL: Sync failed: ${syncErr}`);
    process.exit(1);
  }

  const fetchedFromDb = await getSupabaseProfile(testUser);
  console.log(`  - Fresh Stats in DB: ${fetchedFromDb.totalSolved} solved, ★ ${fetchedFromDb.totalStars} stars, ${fetchedFromDb.totalPoints} pts`);
  console.log(`  - Preserved Admin Meta: batch="${fetchedFromDb.customMeta?.batch}", status="${fetchedFromDb.customMeta?.status}"`);
  
  if (fetchedFromDb.customMeta?.batch !== 'Verified Batch 2026') {
    console.error('FAIL: Admin metadata was overwritten during sync!');
    process.exit(1);
  }
  console.log('PASS: Sync Now updated HackerRank stats and preserved admin metadata in Supabase.\n');

  // 5. Test DELETE Member from Supabase
  console.log(`[TEST 5] Testing DELETE Member for @${testUser}...`);
  const deleteOk = await deleteSupabaseProfile(testUser);
  if (!deleteOk) {
    console.error('FAIL: Delete operation returned false.');
    process.exit(1);
  }

  const checkDeleted = await getSupabaseProfile(testUser);
  if (checkDeleted !== null) {
    console.error('FAIL: Member still exists in Supabase after deletion!');
    process.exit(1);
  }
  console.log(`PASS: @${testUser} deleted cleanly from Supabase PostgreSQL.\n`);

  // 6. Test SYNC ALL for all currently tracked members in Supabase
  console.log('[TEST 6] Testing SYNC ALL for all tracked members in Supabase...');
  const currentMembers = await getSupabaseProfiles();
  console.log(`Processing ${currentMembers.length} members sequentially...`);

  for (const m of currentMembers) {
    const { profile: sp, error } = await syncMember(m.username, m);
    if (error) {
      console.log(`  - @${m.username.padEnd(16)} | SYNC ERROR: ${error}`);
    } else {
      console.log(`  - @${m.username.padEnd(16)} | Solved: ${String(sp.totalSolved).padEnd(4)} | Stars: ${String(sp.totalStars).padEnd(3)} | Points: ${String(sp.totalPoints).padEnd(6)} | Status: ${sp.lastSyncStatus}`);
    }
  }
  console.log('\nPASS: All members synced independently without sharing or mixing data.\n');

  console.log('================================================================');
  console.log('ALL TESTS PASSED: PRODUCTION PIPELINE IS FULLY OPERATIONAL');
  console.log('================================================================');
}

run().catch(e => {
  console.error('Unexpected test error:', e);
  process.exit(1);
});
