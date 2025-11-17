import Layout from "@/components/Layout";
import { DailyPlanner } from "@/components/planner/DailyPlanner";

const TaskBoard = () => {
  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto px-8 py-6 fade-in">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-playfair font-bold text-primary">Planner</h1>
            <p className="text-muted-foreground">Organize and track your content creation tasks</p>
          </div>
        </div>

        <DailyPlanner />
      </div>
    </Layout>
  );
};

export default TaskBoard;
