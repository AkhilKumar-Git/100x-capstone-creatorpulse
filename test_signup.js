// Test script for signup process
// Run this in your browser console to test the signup flow

console.log('🧪 Testing Signup Process...');

// Test function to simulate signup
async function testSignup() {
  try {
    console.log('1️⃣ Testing Supabase connection...');
    
    // Check if supabase is available
    if (typeof supabase === 'undefined') {
      console.error('❌ Supabase client not found. Make sure you\'re on your app page.');
      return;
    }
    
    console.log('✅ Supabase client found');
    
    // Check current session
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log('⚠️ User already signed in. Sign out first to test signup.');
      console.log('Current user:', session.user.email);
      return;
    }
    
    console.log('✅ No active session - ready to test signup');
    
    // Test table existence
    console.log('\n2️⃣ Testing table existence...');
    
    const tables = ['user_settings', 'user_profiles', 'notification_preferences'];
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
        
        if (error) {
          console.error(`❌ Table ${table} error:`, error.message);
        } else {
          console.log(`✅ Table ${table} exists and accessible`);
        }
      } catch (err) {
        console.error(`❌ Table ${table} exception:`, err.message);
      }
    }
    
    console.log('\n3️⃣ Ready for signup test');
    console.log('💡 Now try signing up a new user through your app');
    console.log('💡 The database trigger should automatically create profile data');
    console.log('💡 Check the console for any error messages');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Export for use in console
window.testSignup = testSignup;

// Auto-run if in console
if (typeof window !== 'undefined') {
  console.log('💡 Run testSignup() to test your signup process');
}
