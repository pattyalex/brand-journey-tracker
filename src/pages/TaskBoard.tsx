import Layout from "@/components/Layout";
import { DailyPlanner } from "@/components/planner/DailyPlanner";

const TaskBoard = () => {
  return (
    <Layout>
      <div className="w-full max-w-[1600px] mx-auto px-8 pt-2 pb-6 fade-in">
        <DailyPlanner />
      </div>
    </Layout>
  );
};

export default TaskBoard;
