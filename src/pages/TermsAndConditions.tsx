
import React from 'react';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";

const TermsAndConditions = () => {
  return (
    <Layout>
      <div className="flex flex-col gap-6">
        <h1 className="text-3xl font-bold">Terms and Conditions</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>Terms of Service Agreement</CardTitle>
            <CardDescription>
              Last updated: May 2025
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[60vh]">
              <div className="space-y-6 pr-4">
                <section>
                  <h2 className="text-xl font-semibold mb-3">1. Introduction</h2>
                  <p className="text-muted-foreground mb-2">
                    Welcome to HeyMegan ("we," "our," or "us"). By accessing or using our platform, you agree to be bound by these Terms and Conditions ("Terms").
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">2. Account Registration</h2>
                  <p className="text-muted-foreground mb-2">
                    To use our services, you must create an account. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">3. Subscription and Billing</h2>
                  <p className="text-muted-foreground mb-2">
                    Our platform offers subscription-based services. By subscribing, you agree to pay the applicable fees. Subscription fees are billed in advance on a monthly or annual basis.
                  </p>
                  <p className="text-muted-foreground mb-2">
                    Free trial periods are offered at our discretion. After the trial period, your account will automatically be billed unless you cancel before the trial ends.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">4. Cancellation and Refunds</h2>
                  <p className="text-muted-foreground mb-2">
                    You may cancel your subscription at any time. Upon cancellation, you will continue to have access to the service until the end of your current billing period. No refunds will be provided for unused portions of your subscription.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">5. User Content</h2>
                  <p className="text-muted-foreground mb-2">
                    You retain ownership of any content you upload to our platform. By uploading content, you grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, and display such content solely for the purpose of providing our services to you.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">6. Prohibited Activities</h2>
                  <p className="text-muted-foreground mb-2">
                    You agree not to:
                  </p>
                  <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                    <li>Use our services for any illegal purpose</li>
                    <li>Upload or share content that infringes on intellectual property rights</li>
                    <li>Attempt to gain unauthorized access to our systems</li>
                    <li>Use automated systems to access our platform</li>
                    <li>Transmit any viruses, malware, or other harmful code</li>
                  </ul>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">7. Limitation of Liability</h2>
                  <p className="text-muted-foreground mb-2">
                    We provide our services on an "as is" and "as available" basis. We do not guarantee that our services will be uninterrupted, secure, or error-free.
                  </p>
                  <p className="text-muted-foreground mb-2">
                    In no event shall we be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or related to your use of our services.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">8. Termination</h2>
                  <p className="text-muted-foreground mb-2">
                    We reserve the right to suspend or terminate your account at our sole discretion, with or without notice, for any violation of these Terms or for any other reason.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">9. Changes to Terms</h2>
                  <p className="text-muted-foreground mb-2">
                    We may modify these Terms at any time. If we make changes, we will provide notice by updating the "Last Updated" date at the top of these Terms. Your continued use of our services after such changes constitutes your acceptance of the revised Terms.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">10. Governing Law</h2>
                  <p className="text-muted-foreground mb-2">
                    These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which we operate, without regard to its conflict of law principles.
                  </p>
                </section>

                <section>
                  <h2 className="text-xl font-semibold mb-3">11. Contact Us</h2>
                  <p className="text-muted-foreground mb-2">
                    If you have any questions about these Terms, please contact us at support@heymegan.com.
                  </p>
                </section>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default TermsAndConditions;
