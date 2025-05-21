
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
