
import Layout from "@/components/Layout";

const Privacy = () => {
  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="space-y-6">
          <section>
            <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
            <p className="text-muted-foreground">
              We collect information to provide better services to all our users. The information we collect includes basic account 
              information, content you create, and optional information you choose to provide us.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
            <p className="text-muted-foreground">
              We use the information we collect to provide, maintain, and improve our services, develop new ones, and protect our platform 
              and our users. We also use this information to offer you tailored content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">3. Information Sharing</h2>
            <p className="text-muted-foreground">
              We do not share your personal information with companies, organizations, or individuals outside our platform except in the 
              following cases: with your consent, with domain administrators, for legal reasons, or in case of a merger or acquisition.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">4. Information Security</h2>
            <p className="text-muted-foreground">
              We work hard to protect our users from unauthorized access to or unauthorized alteration, disclosure, or destruction of 
              information we hold. In particular, we encrypt many of our services using SSL.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">5. User Choices</h2>
            <p className="text-muted-foreground">
              You may update, correct, or delete your account information at any time by logging into your account. If you wish to delete 
              your account entirely, please contact us for assistance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">6. Changes to This Policy</h2>
            <p className="text-muted-foreground">
              We may change this privacy policy from time to time. We will not reduce your rights under this Privacy Policy without your 
              explicit consent. We will post any privacy policy changes on this page.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-3">7. Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions or concerns about this privacy policy or our practices, please contact us through our platform 
              or via the contact information provided.
            </p>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default Privacy;
