
import Layout from "@/components/Layout";

const Terms = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
            <p className="text-muted-foreground">
              Welcome to Content Creator Platform. These Terms and Conditions govern your use of our platform 
              and provide information about our service, outlined below. When you use our platform, you agree to these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. Using Our Services</h2>
            <p className="text-muted-foreground">
              You must follow any policies made available to you within the Services. You may use our Services only as 
              permitted by law. We may suspend or stop providing our Services to you if you do not comply with our terms or policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Your Content</h2>
            <p className="text-muted-foreground">
              Our platform allows you to upload, submit, store, send or receive content. You retain ownership of any intellectual 
              property rights that you hold in that content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Subscription and Payments</h2>
            <p className="text-muted-foreground">
              Access to certain features of our platform requires a paid subscription. You agree to pay all fees charged to your account 
              based on the pricing and billing terms presented at the time of subscription.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. Privacy & Copyright Protection</h2>
            <p className="text-muted-foreground">
              Our privacy policies explain how we treat your personal data and protect your privacy when you use our Services. 
              By using our Services, you agree that we can use such data in accordance with our privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Modifying and Terminating our Services</h2>
            <p className="text-muted-foreground">
              We are constantly changing and improving our Services. We may add or remove functionalities or features, 
              and we may suspend or stop a Service altogether.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Liability for our Services</h2>
            <p className="text-muted-foreground">
              When permitted by law, we will not be responsible for lost profits, revenues, or data, financial losses 
              or indirect, special, consequential, exemplary, or punitive damages.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Terms;
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Terms = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Terms of Use</CardTitle>
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
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Link to="/" className="text-blue-600 hover:underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default Terms;
