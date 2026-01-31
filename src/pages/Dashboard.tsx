import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { FolderOpen, Handshake, TrendingUp, CheckCircle, ArrowRight } from "lucide-react";
import { StorageKeys, getString } from "@/lib/storage";
import { KanbanColumn } from "./production/types";
import { cn } from "@/lib/utils";

type GoalStatus = 'not-started' | 'somewhat-done' | 'great-progress' | 'completed';

interface Goal {
  id: number;
  text: string;
  status: GoalStatus;
  progressNote?: string;
}

interface MonthlyGoalsData {
  [year: string]: {
    [month: string]: Goal[];
  };
}

const Dashboard = () => {
  const navigate = useNavigate();

  // Calculate monthly stats from localStorage
  const monthlyStats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59);

    let scheduled = 0;
    let posted = 0;
    let planned = 0;

    const savedData = getString(StorageKeys.productionKanban);
    if (savedData) {
      try {
        const columns: KanbanColumn[] = JSON.parse(savedData);

        // Find to-schedule column for scheduled/posted content
        const toScheduleColumn = columns.find(col => col.id === 'to-schedule');
        toScheduleColumn?.cards.forEach(c => {
          if (c.schedulingStatus === 'scheduled' && c.scheduledDate) {
            const schedDate = new Date(c.scheduledDate);
            if (schedDate >= startOfMonth && schedDate <= endOfMonth) {
              if (schedDate < today) {
                posted++;
              } else {
                scheduled++;
              }
            }
          }
        });

        // Find ideate column for planned content
        const ideateColumn = columns.find(col => col.id === 'ideate');
        ideateColumn?.cards.forEach(c => {
          if (c.plannedDate) {
            const planDate = new Date(c.plannedDate);
            if (planDate >= startOfMonth && planDate <= endOfMonth) {
              planned++;
            }
          }
        });
      } catch (e) {
        console.error("Error parsing production data:", e);
      }
    }

    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    return { scheduled, posted, planned, monthName: monthNames[currentMonth], currentMonth, currentYear };
  }, []);

  // Load monthly goals for current month
  const currentMonthGoals = useMemo(() => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"];
    const currentMonth = monthNames[monthlyStats.currentMonth];
    const currentYear = monthlyStats.currentYear.toString();

    const saved = getString(StorageKeys.monthlyGoalsData);
    if (saved) {
      try {
        const data: MonthlyGoalsData = JSON.parse(saved);
        return data[currentYear]?.[currentMonth] || [];
      } catch {
        return [];
      }
    }
    return [];
  }, [monthlyStats.currentMonth, monthlyStats.currentYear]);

  const completedGoals = currentMonthGoals.filter(g => g.status === 'completed').length;
  const totalGoals = currentMonthGoals.length;

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-6 py-8 fade-in">
        <h1 className="text-3xl font-bold mb-6">Welcome to your Dashboard</h1>

        {/* Monthly Goals */}
        <div className="mb-8 bg-gradient-to-br from-[#faf8f9] to-white rounded-2xl border border-[#8B7082]/10 overflow-hidden">
          {/* Header */}
          <div className="px-6 py-5 border-b border-[#8B7082]/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#612a4f] flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900" style={{ fontFamily: "'Playfair Display', serif" }}>
                    Monthly Goals
                  </h3>
                  <p className="text-sm text-[#8B7082]">{monthlyStats.monthName} 2026</p>
                </div>
              </div>
              {totalGoals > 0 && (
                <div className="text-right">
                  <span className="text-[#612a4f] font-semibold">{completedGoals}/{totalGoals}</span>
                  <span className="text-[#8B7082] ml-1">completed</span>
                </div>
              )}
            </div>
          </div>

          {/* Goals List */}
          <div className="p-4">
            {currentMonthGoals.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No goals set for {monthlyStats.monthName}</p>
                <button
                  onClick={() => navigate('/strategy-growth')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#612a4f] text-white rounded-xl text-sm font-medium hover:bg-[#4d2240] transition-colors"
                >
                  Set Your Goals
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                {currentMonthGoals.slice(0, 4).map((goal) => {
                  const statusColors: Record<GoalStatus, { bg: string; text: string; label: string }> = {
                    'not-started': { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Not Started' },
                    'somewhat-done': { bg: 'bg-amber-50 border border-amber-200', text: 'text-amber-700', label: 'In Progress' },
                    'great-progress': { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'Almost There' },
                    'completed': { bg: 'bg-[#612a4f]/10', text: 'text-[#612a4f]', label: 'Done!' },
                  };
                  const status = statusColors[goal.status] || statusColors['not-started'];

                  return (
                    <div
                      key={goal.id}
                      className="flex items-center gap-4 px-4 py-3.5 bg-white rounded-xl border border-gray-100 hover:border-[#8B7082]/20 transition-colors"
                    >
                      {/* Goal text */}
                      <span className={cn(
                        "flex-1 text-[15px]",
                        goal.status === 'completed' ? "text-gray-400 line-through" : "text-gray-800"
                      )}>
                        {goal.text}
                      </span>

                      {/* Status badge */}
                      <span className={cn(
                        "text-xs font-medium px-3 py-1 rounded-full whitespace-nowrap",
                        status.bg,
                        status.text
                      )}>
                        {status.label}
                      </span>
                    </div>
                  );
                })}

                {/* View All Link */}
                <button
                  onClick={() => navigate('/strategy-growth')}
                  className="w-full flex items-center justify-center gap-2 py-3 text-[#612a4f] hover:text-[#8B7082] text-sm font-medium transition-colors"
                >
                  {currentMonthGoals.length > 4 ? `View all ${currentMonthGoals.length} goals` : 'Manage your goals'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
          <Card className="p-0 overflow-hidden">
            <div className="divide-y">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-4 hover:bg-muted/50 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{activity.title}</p>
                      <p className="text-sm text-muted-foreground">{activity.description}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button 
                key={index} 
                variant="outline" 
                className="h-auto p-4 flex flex-col items-center text-center"
                onClick={() => navigate(action.link)}
              >
                <action.icon className="h-6 w-6 mb-2" />
                <span>{action.label}</span>
              </Button>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

const recentActivity = [
  {
    title: "Content Idea Added",
    description: "You added 'Summer Travel Tips' to your content ideas",
    time: "2 hours ago"
  },
  {
    title: "Post Scheduled",
    description: "Instagram post scheduled for May 20th at 9:00 AM",
    time: "Yesterday"
  },
  {
    title: "Brand Deal Updated",
    description: "Contract approved for Skincare Brand collaboration",
    time: "2 days ago"
  },
  {
    title: "Analytics Updated",
    description: "April performance report is now available",
    time: "3 days ago"
  }
];

const quickActions = [
  {
    label: "New Content Idea",
    icon: TrendingUp,
    link: "/content-ideation"
  },
  {
    label: "Schedule Post",
    icon: FolderOpen,
    link: "/content-calendar"
  },
  {
    label: "Manage Brand Deals",
    icon: Handshake,
    link: "/collab-management"
  },
  {
    label: "View Analytics",
    icon: CheckCircle,
    link: "/analytics"
  }
];

export default Dashboard;