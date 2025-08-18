// Debug script for Supabase database connection
// Run this in your browser console on your app

console.log('🔍 Debugging Supabase Database Connection...');

// Test basic connection
async function testConnection() {
  try {
    const { data, error } = await supabase.auth.getSession();
    console.log('✅ Auth connection:', { data, error });
    
    if (error) {
      console.error('❌ Auth error:', error);
      return false;
    }
    
    return true;
  } catch (err) {
    console.error('❌ Connection exception:', err);
    return false;
  }
}

// Test if tables exist
async function testTables() {
  const tables = ['user_settings', 'user_profiles', 'notification_preferences'];
  const results = {};
  
  for (const table of tables) {
    try {
      const { data, error } = await supabase
        .from(table)
        .select('*')
        .limit(1);
      
      results[table] = {
        exists: !error,
        error: error?.message || null,
        data: data
      };
      
      console.log(`📊 Table ${table}:`, results[table]);
    } catch (err) {
      results[table] = {
        exists: false,
        error: err.message,
        data: null
      };
      console.error(`❌ Table ${table} error:`, err);
    }
  }
  
  return results;
}

// Test user creation
async function testUserCreation() {
  try {
    // This is just a test - don't actually create a user
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        full_name: 'Test User',
        username: 'test_user_debug'
      })
      .select();
    
    if (error) {
      console.log('❌ User creation test failed (expected):', error.message);
      return false;
    }
    
    console.log('✅ User creation test passed:', data);
    return true;
  } catch (err) {
    console.log('❌ User creation test exception (expected):', err.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('\n🚀 Running Database Tests...\n');
  
  // Test 1: Connection
  console.log('1️⃣ Testing Connection...');
  const connectionOk = await testConnection();
  
  if (!connectionOk) {
    console.error('❌ Connection failed - cannot proceed');
    return;
  }
  
  // Test 2: Tables
  console.log('\n2️⃣ Testing Tables...');
  const tableResults = await testTables();
  
  // Test 3: User Creation
  console.log('\n3️⃣ Testing User Creation...');
  await testUserCreation();
  
  // Summary
  console.log('\n📋 SUMMARY:');
  console.log('Connection:', connectionOk ? '✅ OK' : '❌ FAILED');
  
  const allTablesExist = Object.values(tableResults).every(r => r.exists);
  console.log('Tables:', allTablesExist ? '✅ ALL EXIST' : '❌ MISSING');
  
  if (!allTablesExist) {
    console.log('\n🔧 TO FIX:');
    console.log('1. Go to Supabase Dashboard → SQL Editor');
    console.log('2. Run the complete SQL script from supabase_complete_setup.sql');
    console.log('3. Refresh this page and run tests again');
  }
  
  return { connectionOk, tableResults, allTablesExist };
}

// Export for use in console
window.debugDatabase = runAllTests;

// Auto-run if in console
if (typeof window !== 'undefined') {
  console.log('💡 Run debugDatabase() to test your database connection');
}
