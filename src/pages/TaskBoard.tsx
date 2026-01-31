import Layout from "@/components/Layout";
import { DailyPlanner } from "@/components/planner/DailyPlanner";

const TaskBoard = () => {
  return (
    <Layout>
      <div className="w-full h-full">
        <DailyPlanner />
      </div>
    </Layout>
  );
};

export default TaskBoard;
