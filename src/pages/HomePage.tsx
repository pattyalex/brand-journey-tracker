
import Layout from "@/components/Layout";

const HomePage = () => {
  return (
    <Layout>
      <div className="container mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">Home Page</h1>
        <p className="text-lg text-muted-foreground">
          Welcome to your new home page. You can customize this page with your own content.
        </p>
      </div>
    </Layout>
  );
};

export default HomePage;
