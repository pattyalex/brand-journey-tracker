
export async function diagnoseSupabaseEmailValidation() {
  console.log('=== SUPABASE EMAIL VALIDATION DIAGNOSTICS ===');
  
  try {
    const { supabase } = await import('./supabaseClient');
    
    // Test various email formats
    const testEmails = [
      'george@heymegan.com',
      'test@heymegan.com',
      'user@gmail.com',
      'admin@example.com',
      'support@heymegan.com'
    ];
    
    console.log('Testing email validation for different formats...');
    
    for (const email of testEmails) {
      console.log(`\n--- Testing: ${email} ---`);
      
      try {
        const authUrl = `${supabase.supabaseUrl}/auth/v1/signup`;
        const payload = {
          email: email,
          password: 'TestPassword123!',
          data: { full_name: 'Test User' }
        };
        
        const response = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          body: JSON.stringify(payload)
        });
        
        console.log(`Status: ${response.status}`);
        
        if (response.status === 400) {
          const errorText = await response.text();
          console.log(`Error: ${errorText}`);
          
          try {
            const errorJson = JSON.parse(errorText);
            if (errorJson.msg && errorJson.msg.includes('invalid')) {
              console.log('❌ EMAIL VALIDATION FAILED');
              console.log('This suggests domain or format restrictions');
            }
          } catch (parseError) {
            console.log('Could not parse error response');
          }
        } else if (response.ok) {
          console.log('✅ EMAIL VALIDATION PASSED');
        } else {
          console.log(`⚠️ Unexpected status: ${response.status}`);
        }
      } catch (error) {
        console.error(`Error testing ${email}:`, error);
      }
    }
    
    // Check Supabase configuration
    console.log('\n=== SUPABASE CONFIGURATION ===');
    console.log(`Supabase URL: ${supabase.supabaseUrl}`);
    console.log(`Project ID: ${supabase.supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown'}`);
    console.log(`Auth endpoint: ${supabase.supabaseUrl}/auth/v1/signup`);
    
    // Test auth settings endpoint (might be restricted)
    try {
      const settingsUrl = `${supabase.supabaseUrl}/auth/v1/settings`;
      const settingsResponse = await fetch(settingsUrl, {
        method: 'GET',
        headers: {
          'apikey': supabase.supabaseKey,
          'Authorization': `Bearer ${supabase.supabaseKey}`
        }
      });
      
      if (settingsResponse.ok) {
        const settings = await settingsResponse.json();
        console.log('Auth settings:', settings);
      } else {
        console.log(`Settings endpoint status: ${settingsResponse.status}`);
      }
    } catch (error) {
      console.log('Could not fetch auth settings:', error);
    }
    
    console.log('\n=== RECOMMENDATIONS ===');
    console.log('1. Check Supabase Dashboard > Authentication > Settings');
    console.log('2. Look for "Email domains" or "Allowed domains" settings');
    console.log('3. Check if email confirmations are required');
    console.log('4. Verify SMTP settings if using custom email provider');
    console.log('5. Check rate limiting settings');
    
  } catch (error) {
    console.error('Diagnostic failed:', error);
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).diagnoseSupabaseEmailValidation = diagnoseSupabaseEmailValidation;
}
