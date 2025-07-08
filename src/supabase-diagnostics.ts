
export async function diagnoseSupabaseEmailValidation() {
  console.log('=== COMPREHENSIVE SUPABASE EMAIL VALIDATION DIAGNOSTICS ===');
  
  try {
    const { supabase } = await import('./supabaseClient');
    
    // Comprehensive test email list with various formats and edge cases
    const testEmails = [
      // Primary test emails
      'george@heymegan.com',
      'test@heymegan.com',
      'support@heymegan.com',
      'admin@heymegan.com',
      'info@heymegan.com',
      
      // Common domains
      'user@gmail.com',
      'user@yahoo.com',
      'user@outlook.com',
      'user@hotmail.com',
      'admin@example.com',
      
      // Edge cases
      'test.email@heymegan.com',
      'test+tag@heymegan.com',
      'test-user@heymegan.com',
      'test_user@heymegan.com',
      'TEST@HEYMEGAN.COM',
      '  george@heymegan.com  ', // With whitespace
      'George@HeyMegan.Com', // Mixed case
      
      // Invalid formats for comparison
      'invalid-email',
      'missing@domain',
      '@missinglocal.com',
      'multiple@@symbols.com'
    ];
    
    console.log(`Testing ${testEmails.length} email formats for validation patterns...`);
    
    const results = [];
    
    for (let i = 0; i < testEmails.length; i++) {
      const email = testEmails[i];
      console.log(`\n--- Testing ${i + 1}/${testEmails.length}: "${email}" ---`);
      
      const testResult = {
        email: email,
        originalEmail: email,
        cleanedEmail: email.trim().toLowerCase().normalize(),
        status: null,
        error: null,
        responseBody: null,
        isValid: false,
        validationTime: 0
      };
      
      try {
        const startTime = Date.now();
        const authUrl = `${supabase.supabaseUrl}/auth/v1/signup`;
        const payload = {
          email: email,
          password: 'TestPassword123!',
          data: { full_name: 'Test User' }
        };
        
        console.log(`Request payload:`, JSON.stringify(payload, null, 2));
        console.log(`Email char codes: [${Array.from(email).map(c => c.charCodeAt(0)).join(', ')}]`);
        console.log(`Email hex: ${Array.from(email).map(c => c.charCodeAt(0).toString(16)).join(' ')}`);
        
        const response = await fetch(authUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          },
          body: JSON.stringify(payload)
        });
        
        const endTime = Date.now();
        testResult.validationTime = endTime - startTime;
        testResult.status = response.status;
        
        const responseText = await response.text();
        testResult.responseBody = responseText;
        
        console.log(`Status: ${response.status} (${testResult.validationTime}ms)`);
        
        if (response.status === 400) {
          console.log(`❌ VALIDATION FAILED`);
          console.log(`Error response: ${responseText}`);
          
          try {
            const errorJson = JSON.parse(responseText);
            testResult.error = errorJson;
            
            if (errorJson.msg && errorJson.msg.includes('invalid')) {
              console.log('🔍 EMAIL VALIDATION ERROR DETECTED');
              console.log('Error details:', errorJson);
            }
          } catch (parseError) {
            console.log('Could not parse error response as JSON');
            testResult.error = { message: responseText };
          }
        } else if (response.ok) {
          console.log(`✅ EMAIL VALIDATION PASSED`);
          testResult.isValid = true;
          
          try {
            const successJson = JSON.parse(responseText);
            console.log('Success response data:', successJson);
          } catch (parseError) {
            console.log('Could not parse success response as JSON');
          }
        } else {
          console.log(`⚠️ UNEXPECTED STATUS: ${response.status}`);
          console.log(`Response: ${responseText}`);
        }
        
        // Test with cleaned email if original failed
        if (response.status === 400 && email !== testResult.cleanedEmail) {
          console.log(`🔄 TESTING CLEANED VERSION: "${testResult.cleanedEmail}"`);
          
          const cleanedPayload = {
            email: testResult.cleanedEmail,
            password: 'TestPassword123!',
            data: { full_name: 'Test User' }
          };
          
          const cleanedResponse = await fetch(authUrl, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': supabase.supabaseKey,
              'Authorization': `Bearer ${supabase.supabaseKey}`
            },
            body: JSON.stringify(cleanedPayload)
          });
          
          console.log(`Cleaned email status: ${cleanedResponse.status}`);
          
          if (cleanedResponse.ok) {
            console.log(`✅ CLEANED EMAIL PASSED`);
            testResult.cleanedEmailWorks = true;
          } else {
            const cleanedErrorText = await cleanedResponse.text();
            console.log(`❌ CLEANED EMAIL ALSO FAILED: ${cleanedErrorText}`);
            testResult.cleanedEmailWorks = false;
          }
        }
        
      } catch (error) {
        console.error(`❌ NETWORK ERROR testing ${email}:`, error);
        testResult.error = { message: error.message, type: 'network_error' };
      }
      
      results.push(testResult);
    }
    
    // Analyze results
    console.log('\n=== DIAGNOSTIC RESULTS ANALYSIS ===');
    const validEmails = results.filter(r => r.isValid);
    const invalidEmails = results.filter(r => !r.isValid && r.status === 400);
    const networkErrors = results.filter(r => r.error?.type === 'network_error');
    const unexpectedStatuses = results.filter(r => r.status && r.status !== 200 && r.status !== 400);
    
    console.log(`✅ Valid emails: ${validEmails.length}/${results.length}`);
    console.log(`❌ Invalid emails: ${invalidEmails.length}/${results.length}`);
    console.log(`🌐 Network errors: ${networkErrors.length}/${results.length}`);
    console.log(`⚠️ Unexpected statuses: ${unexpectedStatuses.length}/${results.length}`);
    
    // Domain analysis
    const heymeganEmails = results.filter(r => r.email.toLowerCase().includes('heymegan.com'));
    const heymeganValid = heymeganEmails.filter(r => r.isValid);
    
    console.log(`\n=== HEYMEGAN.COM DOMAIN ANALYSIS ===`);
    console.log(`HeyMegan emails tested: ${heymeganEmails.length}`);
    console.log(`HeyMegan emails valid: ${heymeganValid.length}/${heymeganEmails.length}`);
    
    if (heymeganEmails.length > 0 && heymeganValid.length === 0) {
      console.log('🚨 CRITICAL: ALL HEYMEGAN.COM EMAILS FAILED VALIDATION');
      console.log('This suggests a domain-specific restriction in Supabase settings');
    }
    
    // Error pattern analysis
    const errorPatterns = {};
    invalidEmails.forEach(result => {
      const errorMsg = result.error?.msg || result.error?.message || 'Unknown error';
      errorPatterns[errorMsg] = (errorPatterns[errorMsg] || 0) + 1;
    });
    
    console.log(`\n=== ERROR PATTERNS ===`);
    Object.entries(errorPatterns).forEach(([error, count]) => {
      console.log(`"${error}": ${count} occurrences`);
    });
    
    // Check Supabase configuration
    console.log('\n=== SUPABASE CONFIGURATION ===');
    console.log(`Supabase URL: ${supabase.supabaseUrl}`);
    console.log(`Project ID: ${supabase.supabaseUrl.split('//')[1]?.split('.')[0] || 'unknown'}`);
    console.log(`Auth endpoint: ${supabase.supabaseUrl}/auth/v1/signup`);
    console.log(`API Key (first 20 chars): ${supabase.supabaseKey?.substring(0, 20)}`);
    
    // Test auth settings and health endpoints
    const configTests = [
      { name: 'Auth Settings', url: `${supabase.supabaseUrl}/auth/v1/settings` },
      { name: 'Auth Health', url: `${supabase.supabaseUrl}/auth/v1/health` },
      { name: 'REST Health', url: `${supabase.supabaseUrl}/rest/v1/` }
    ];
    
    for (const test of configTests) {
      try {
        console.log(`\n--- Testing ${test.name} ---`);
        const response = await fetch(test.url, {
          method: 'GET',
          headers: {
            'apikey': supabase.supabaseKey,
            'Authorization': `Bearer ${supabase.supabaseKey}`
          }
        });
        
        console.log(`${test.name} status: ${response.status}`);
        
        if (response.ok) {
          const data = await response.text();
          try {
            const jsonData = JSON.parse(data);
            console.log(`${test.name} data:`, jsonData);
          } catch {
            console.log(`${test.name} response (text):`, data.substring(0, 200));
          }
        } else {
          const errorText = await response.text();
          console.log(`${test.name} error:`, errorText.substring(0, 200));
        }
      } catch (error) {
        console.log(`${test.name} failed:`, error.message);
      }
    }
    
    // Generate recommendations
    console.log('\n=== 🎯 ACTIONABLE RECOMMENDATIONS ===');
    
    if (heymeganEmails.length > 0 && heymeganValid.length === 0) {
      console.log('🚨 URGENT: Domain restriction detected for heymegan.com');
      console.log('📋 Actions:');
      console.log('   1. Check Supabase Dashboard > Authentication > Settings');
      console.log('   2. Look for "Allowed email domains" or similar settings');
      console.log('   3. Add "heymegan.com" to allowed domains if restricted');
      console.log('   4. Check email confirmation requirements');
    }
    
    if (errorPatterns['Email address is invalid'] || Object.keys(errorPatterns).some(e => e.includes('invalid'))) {
      console.log('📧 EMAIL FORMAT ISSUE detected');
      console.log('📋 Actions:');
      console.log('   1. Implement email cleaning (trim, lowercase) - ✅ DONE');
      console.log('   2. Use fallback retry with cleaned emails - ✅ DONE');
      console.log('   3. Check for hidden Unicode characters');
      console.log('   4. Verify email regex patterns in Supabase settings');
    }
    
    if (networkErrors.length > 0) {
      console.log('🌐 NETWORK CONNECTIVITY issues detected');
      console.log('📋 Actions:');
      console.log('   1. Check internet connection');
      console.log('   2. Verify Supabase URL and API key');
      console.log('   3. Check for firewall or proxy restrictions');
    }
    
    if (results.every(r => !r.isValid)) {
      console.log('🚨 CRITICAL: ALL EMAILS FAILED - Possible configuration issue');
      console.log('📋 Actions:');
      console.log('   1. Verify Supabase project is active');
      console.log('   2. Check API key permissions');
      console.log('   3. Review auth service status');
      console.log('   4. Contact Supabase support if needed');
    }
    
    console.log('\n=== DIAGNOSTIC COMPLETE ===');
    console.log('Results stored in browser console for detailed analysis');
    
    // Store results globally for manual inspection
    if (typeof window !== 'undefined') {
      (window as any).emailDiagnosticResults = results;
      console.log('📊 Detailed results available at: window.emailDiagnosticResults');
    }
    
    return results;
    
  } catch (error) {
    console.error('❌ DIAGNOSTIC FAILED:', error);
    throw error;
  }
}

// Make it available globally for console testing
if (typeof window !== 'undefined') {
  (window as any).diagnoseSupabaseEmailValidation = diagnoseSupabaseEmailValidation;
}
