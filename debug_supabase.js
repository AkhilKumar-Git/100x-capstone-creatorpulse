// Debug script to test Supabase connection
// Run this in your browser console on your app to test the connection

console.log('Environment variables:');
console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'Not set');

// Test basic connection
import { supabase } from './src/lib/supabase.ts';

// Test if we can connect to Supabase
supabase.auth.getSession().then(({ data, error }) => {
  console.log('Supabase connection test:');
  console.log('Session data:', data);
  console.log('Session error:', error);
});

// Test signup with dummy data (don't actually run this)
// supabase.auth.signUp({
//   email: 'test@example.com',
//   password: 'testpassword123',
//   options: {
//     data: {
//       full_name: 'Test User',
//     },
//   },
// }).then(({ data, error }) => {
//   console.log('Signup test:');
//   console.log('Data:', data);
//   console.log('Error:', error);
// });
