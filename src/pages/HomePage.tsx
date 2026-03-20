import React from "react";
import Layout from "@/components/Layout";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useHomePageState } from "./hooks/useHomePageState";
import WelcomeSection from "@/components/home/WelcomeSection";
import TopPrioritiesWidget from "@/components/home/TopPrioritiesWidget";
import ContinueCreatingWidget from "@/components/home/ContinueCreatingWidget";
import UpcomingPartnershipsWidget from "@/components/home/UpcomingPartnershipsWidget";
import WorkHabitsWidget from "@/components/home/WorkHabitsWidget";
import MonthlyGoalsWidget from "@/components/home/MonthlyGoalsWidget";
import MissionStatementWidget from "@/components/home/MissionStatementWidget";

const HomePage = () => {
  const state = useHomePageState();

  return (
      <Layout>
        <ScrollArea className="h-full">
          <div
            className="min-h-full"
            style={{
              background: '#f9f7f5',
            }}
          >
            <div className="container px-4 sm:px-6 md:px-8 pt-4 sm:pt-5 pb-10">
              {/* Greeting Section with Date Badge */}
              <WelcomeSection greeting={state.greeting} />

            {/* Bento Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 mt-3 sm:mt-4 items-stretch">

              {/* Top 3 Priorities - 1 column */}
              <TopPrioritiesWidget
                priorities={state.priorities}
                editingPriorityId={state.editingPriorityId}
                setEditingPriorityId={state.setEditingPriorityId}
                handleUpdatePriority={state.handleUpdatePriority}
                handleTogglePriority={state.handleTogglePriority}
                showCelebration={state.showCelebration}
                setShowCelebration={state.setShowCelebration}
              />

              {/* Continue Creating Section - 1 column */}
              <ContinueCreatingWidget
                continueCreatingCards={state.continueCreatingCards}
                dismissedPlaceholders={state.dismissedPlaceholders}
                dismissPlaceholder={state.dismissPlaceholder}
              />

              {/* Upcoming Partnerships Section - 1 column */}
              <UpcomingPartnershipsWidget
                brandDealsData={state.brandDealsData}
                dismissedPlaceholders={state.dismissedPlaceholders}
                dismissPlaceholder={state.dismissPlaceholder}
              />

              {/* Work Habits + Monthly Goals Row */}
              <div className="md:col-span-3 flex flex-col lg:flex-row gap-3 sm:gap-4">
              {/* Work Habits Section */}
              <WorkHabitsWidget
                habits={state.habits}
                habitWeekOffset={state.habitWeekOffset}
                isAddingHabit={state.isAddingHabit}
                setIsAddingHabit={state.setIsAddingHabit}
                newHabitName={state.newHabitName}
                setNewHabitName={state.setNewHabitName}
                editingHabitId={state.editingHabitId}
                editingHabitName={state.editingHabitName}
                setEditingHabitName={state.setEditingHabitName}
                editingGoalHabitId={state.editingGoalHabitId}
                truncatedHabitHover={state.truncatedHabitHover}
                setTruncatedHabitHover={state.setTruncatedHabitHover}
                editingGoalTarget={state.editingGoalTarget}
                setEditingGoalTarget={state.setEditingGoalTarget}
                newHabitGoalTarget={state.newHabitGoalTarget}
                setNewHabitGoalTarget={state.setNewHabitGoalTarget}
                habitsScrollRef={state.habitsScrollRef}
                getWeekDays={state.getWeekDays}
                getWeeklyCompletions={state.getWeeklyCompletions}
                isHabitBehindPace={state.isHabitBehindPace}
                toggleHabit={state.toggleHabit}
                addHabit={state.addHabit}
                deleteHabit={state.deleteHabit}
                keepPlaceholderHabit={state.keepPlaceholderHabit}
                startEditingHabit={state.startEditingHabit}
                saveEditingHabit={state.saveEditingHabit}
                cancelEditingHabit={state.cancelEditingHabit}
                startEditingGoal={state.startEditingGoal}
                saveGoal={state.saveGoal}
                dismissedPlaceholders={state.dismissedPlaceholders}
                dismissPlaceholder={state.dismissPlaceholder}
              />

              {/* Monthly Goals Section */}
              <MonthlyGoalsWidget
                getCurrentMonth={state.getCurrentMonth}
                getCurrentYear={state.getCurrentYear}
                getCurrentMonthGoals={state.getCurrentMonthGoals}
                editingMonthlyGoalId={state.editingMonthlyGoalId}
                setEditingMonthlyGoalId={state.setEditingMonthlyGoalId}
                editingMonthlyGoalText={state.editingMonthlyGoalText}
                setEditingMonthlyGoalText={state.setEditingMonthlyGoalText}
                handleEditMonthlyGoal={state.handleEditMonthlyGoal}
                handleCycleGoalStatus={state.handleCycleGoalStatus}
                handleDeleteMonthlyGoal={state.handleDeleteMonthlyGoal}
                monthlyGoalsScrollRef={state.monthlyGoalsScrollRef}
                dismissedPlaceholders={state.dismissedPlaceholders}
                dismissPlaceholder={state.dismissPlaceholder}
                keepPlaceholderGoal={state.keepPlaceholderGoal}
              />
              </div>

              {/* Mission Statement - Full width */}
              <MissionStatementWidget
                missionStatement={state.missionStatement}
              />

            </div>
            {/* End Bento Grid */}

            </div>
          </div>
        </ScrollArea>

      </Layout>
  );
};

export default HomePage;
