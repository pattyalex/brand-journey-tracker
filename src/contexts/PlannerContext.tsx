import React, { createContext, useContext, useCallback } from "react";
import { addDays, subDays } from "date-fns";
import { PlannerView } from "@/components/planner/dailyPlanner/types";
import { ContentDisplayMode } from "@/components/planner/dailyPlanner/hooks/usePlannerState";

// ─── Context value type ────────────────────────────────────────────────
// Only the most-commonly-prop-drilled planner values live here:
//   • selectedDate + setter
//   • currentView + setter
//   • navigation helpers (prev / next / date-select)
//   • contentDisplayMode + setter

export interface PlannerContextValue {
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  currentView: PlannerView;
  setCurrentView: (view: PlannerView) => void;
  handlePreviousDay: () => void;
  handleNextDay: () => void;
  handleDateSelect: (date: Date | undefined) => void;
  contentDisplayMode: ContentDisplayMode;
  setContentDisplayMode: (mode: ContentDisplayMode) => void;
}

const PlannerCtx = createContext<PlannerContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────
// Wraps the planner route subtree.  Accepts values from usePlannerState
// and usePlannerActions that are already being computed.

export interface PlannerProviderProps {
  children: React.ReactNode;
  selectedDate: Date;
  setSelectedDate: React.Dispatch<React.SetStateAction<Date>>;
  currentView: PlannerView;
  setCurrentView: (view: PlannerView) => void;
  handlePreviousDay: () => void;
  handleNextDay: () => void;
  handleDateSelect: (date: Date | undefined) => void;
  contentDisplayMode: ContentDisplayMode;
  setContentDisplayMode: (mode: ContentDisplayMode) => void;
}

export const PlannerProvider: React.FC<PlannerProviderProps> = ({
  children,
  ...value
}) => {
  return <PlannerCtx.Provider value={value}>{children}</PlannerCtx.Provider>;
};

// ─── Consumer hook ─────────────────────────────────────────────────────

export function usePlannerContext(): PlannerContextValue {
  const ctx = useContext(PlannerCtx);
  if (!ctx) {
    throw new Error(
      "usePlannerContext must be used within a <PlannerProvider>",
    );
  }
  return ctx;
}
