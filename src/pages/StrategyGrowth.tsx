import React from "react";
import Layout from "@/components/Layout";
import GoalsOnboarding from "@/components/GoalsOnboarding";
import { Tabs } from "@/components/ui/tabs";
import StrategyTabsList from "@/components/strategy/StrategyTabsList";
import BrandIdentityTab from "@/components/strategy/BrandIdentityTab";
import GrowthGoalsTab from "@/components/strategy/GrowthGoalsTab";
import { useStrategyState } from "@/components/strategy/useStrategyState";

const StrategyGrowth = () => {
  const state = useStrategyState();

  return (
    <Layout>
      <GoalsOnboarding run={state.showOnboarding && state.activeTab === 'growth-goals'} onComplete={state.completeOnboarding} />
      <div className="w-full h-full mx-auto px-8 py-6 bg-gradient-to-br from-[#F7F4F5] via-[#FAFAFA] to-[#FFFDF9] overflow-auto">
        <div className="max-w-[1600px] mx-auto space-y-6">

          {/* Tabs */}
          <Tabs value={state.activeTab} onValueChange={state.handleTabChange} className="w-full">
            <StrategyTabsList activeTab={state.activeTab} handleTabChange={state.handleTabChange} />

            {/* Positioning Tab */}
            <BrandIdentityTab
              missionStatement={state.missionStatement}
              setMissionStatement={state.setMissionStatement}
              missionStatementFocused={state.missionStatementFocused}
              setMissionStatementFocused={state.setMissionStatementFocused}
              showMissionSaved={state.showMissionSaved}
              brandValues={state.brandValues}
              setBrandValues={state.setBrandValues}
              customValueInput={state.customValueInput}
              setCustomValueInput={state.setCustomValueInput}
              editingValueIndex={state.editingValueIndex}
              setEditingValueIndex={state.setEditingValueIndex}
              editingValueText={state.editingValueText}
              setEditingValueText={state.setEditingValueText}
              selectedTones={state.selectedTones}
              setSelectedTones={state.setSelectedTones}
              audienceAgeRanges={state.audienceAgeRanges}
              setAudienceAgeRanges={state.setAudienceAgeRanges}
              audienceStruggles={state.audienceStruggles}
              setAudienceStruggles={state.setAudienceStruggles}
              audienceDesires={state.audienceDesires}
              setAudienceDesires={state.setAudienceDesires}
              strugglesFocused={state.strugglesFocused}
              setStrugglesFocused={state.setStrugglesFocused}
              desiresFocused={state.desiresFocused}
              setDesiresFocused={state.setDesiresFocused}
              visionBoardImages={state.visionBoardImages}
              removeVisionBoardImage={state.removeVisionBoardImage}
              pinterestUrl={state.pinterestUrl}
              updatePinterestUrl={state.updatePinterestUrl}
              showPinterestInput={state.showPinterestInput}
              setShowPinterestInput={state.setShowPinterestInput}
              fileInputRef={state.fileInputRef}
              handleUploadClick={state.handleUploadClick}
              handleVisionBoardUpload={state.handleVisionBoardUpload}
              additionalNotes={state.additionalNotes}
              setAdditionalNotes={state.setAdditionalNotes}
              noteLinks={state.noteLinks}
              setNoteLinks={state.setNoteLinks}
              noteFiles={state.noteFiles}
              setNoteFiles={state.setNoteFiles}
              newLinkUrl={state.newLinkUrl}
              setNewLinkUrl={state.setNewLinkUrl}
              newLinkTitle={state.newLinkTitle}
              setNewLinkTitle={state.setNewLinkTitle}
              showAddLinkForm={state.showAddLinkForm}
              setShowAddLinkForm={state.setShowAddLinkForm}
            />

            {/* Growth Goals Tab */}
            <GrowthGoalsTab
              threeYearVision={state.threeYearVision}
              setThreeYearVision={state.setThreeYearVision}
              shortTermGoals={state.shortTermGoals}
              isAddingShortTermGoal={state.isAddingShortTermGoal}
              setIsAddingShortTermGoal={state.setIsAddingShortTermGoal}
              newShortTermGoal={state.newShortTermGoal}
              setNewShortTermGoal={state.setNewShortTermGoal}
              handleAddShortTermGoal={state.handleAddShortTermGoal}
              handleChangeShortTermGoalStatus={state.handleChangeShortTermGoalStatus}
              handleDeleteShortTermGoal={state.handleDeleteShortTermGoal}
              handleEditShortTermGoal={state.handleEditShortTermGoal}
              handleSaveShortTermGoal={state.handleSaveShortTermGoal}
              editingShortTermId={state.editingShortTermId}
              editingShortTermText={state.editingShortTermText}
              setEditingShortTermText={state.setEditingShortTermText}
              setEditingShortTermId={state.setEditingShortTermId}
              selectedYear={state.selectedYear}
              setSelectedYear={state.setSelectedYear}
              selectedMonthPill={state.selectedMonthPill}
              setSelectedMonthPill={state.setSelectedMonthPill}
              getMonthlyGoals={state.getMonthlyGoals}
              newMonthlyGoalInputs={state.newMonthlyGoalInputs}
              setNewMonthlyGoalInputs={state.setNewMonthlyGoalInputs}
              handleAddMonthlyGoal={state.handleAddMonthlyGoal}
              handleChangeMonthlyGoalStatus={state.handleChangeMonthlyGoalStatus}
              handleDeleteMonthlyGoal={state.handleDeleteMonthlyGoal}
              handleEditMonthlyGoal={state.handleEditMonthlyGoal}
              handleSaveMonthlyGoal={state.handleSaveMonthlyGoal}
              editingMonthlyId={state.editingMonthlyId}
              editingMonthlyText={state.editingMonthlyText}
              setEditingMonthlyText={state.setEditingMonthlyText}
              setEditingMonthlyId={state.setEditingMonthlyId}
              dismissedGoalPlaceholders={state.dismissedGoalPlaceholders}
              dismissGoalPlaceholder={state.dismissGoalPlaceholder}
              draggedGoal={state.draggedGoal}
              dragOverMonth={state.dragOverMonth}
              handleDragStart={state.handleDragStart}
              handleDragOver={state.handleDragOver}
              handleDragEndMonthlyGoals={state.handleDragEndMonthlyGoals}
              handleDragCancel={state.handleDragCancel}
            />
          </Tabs>
        </div>
      </div>
    </Layout>
  );
};

export default StrategyGrowth;
