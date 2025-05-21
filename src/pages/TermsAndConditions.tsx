
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const TermsAndConditions = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Terms and Conditions</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this platform, you accept and agree to be bound by the terms and provision of this agreement.
            </p>
            
            <h2 className="text-xl font-semibold">2. Use License</h2>
            <p>
              Permission is granted to temporarily use this software and platform for personal, non-commercial purposes only. This is the grant of a license, not a transfer of title.
            </p>
            
            <h2 className="text-xl font-semibold">3. Disclaimer</h2>
            <p>
              The platform is provided on an 'as is' basis. The company makes no warranties, expressed or implied, and hereby disclaims all warranties.
            </p>
            
            <h2 className="text-xl font-semibold">4. Limitations</h2>
            <p>
              In no event shall the company be liable for any damages arising out of the use or inability to use the materials on the platform.
            </p>
            
            <h2 className="text-xl font-semibold">5. Privacy</h2>
            <p>
              Your use of this platform is also governed by our Privacy Policy, which is incorporated by reference into these Terms and Conditions.
            </p>
            
            <h2 className="text-xl font-semibold">6. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with applicable laws and any dispute shall be subject to the exclusive jurisdiction of the courts.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsAndConditions;
