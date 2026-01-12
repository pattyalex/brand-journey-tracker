# Refactor Inventory

## localStorage keys

- `allTasks` — src/components/planner/DailyPlanner.tsx:510
- `bankOfIdeas` — src/pages/Production.tsx:277
- `collabBrands` — src/hooks/collab/useCollabStorage.ts:48
- `collabColumns` — src/hooks/collab/useCollabStorage.ts:84
- `content-formats-${pillarId}` — src/components/content/IdeaSection.tsx:85; src/components/content/ContentTypeBuckets.tsx:100
- `contentFormats` — src/components/content/FormatSelector.tsx:44
- `contentPillars` — src/hooks/useContentPlanning.ts:19
- `contentRestorationLog` — src/utils/contentRestoreUtils.ts:48
- `customHooks` — src/components/content/TitleHookSuggestions.tsx:422
- `firecrawl_api_key` — src/utils/FirecrawlService.ts:20
- `globalPlannerData` — src/components/planner/DailyPlanner.tsx:503
- `growthGoals` — src/pages/HomePage.tsx:208
- `hasCompletedOnboarding` — src/contexts/AuthContext.tsx:39
- `hasSeenGoalsOnboarding` — src/hooks/useOnboarding.ts:3
- `journalEntries` — src/pages/HomePage.tsx:179
- `lastAccessDate` — src/pages/HomePage.tsx:169
- `longTermGoals` — src/pages/StrategyGrowth.tsx:160
- `monthlyGoalsData` — src/pages/HomePage.tsx:92
- `openai_api_key` — src/components/settings/OpenAISettings.tsx:40
- `openai_api_key_masked` — src/components/settings/OpenAISettings.tsx:21
- `openai_key_set` — src/components/analytics/AIRecommendations.tsx:31
- `pillars` — src/components/content/ideaDialog/DialogContent.tsx:125
- `plannerData` — src/components/planner/DailyPlanner.tsx:498
- `plannerLastAccessDate` — src/components/planner/DailyPlanner.tsx:146
- `platformUsernames` — src/components/analytics/AIRecommendations.tsx:84
- `productionKanban` — src/pages/Production.tsx:302
- `quickNotes` — src/pages/QuickNotes.tsx:26
- `readyToScheduleContent` — src/hooks/useCalendarState.ts:21
- `researchItems` — src/pages/Research.tsx:30
- `restoredToIdeasContent` — src/utils/contentRestoreUtils.ts:7
- `scheduledContent` — src/components/planner/DailyPlanner.tsx:519
- `selectedTimezone` — src/components/planner/DailyPlanner.tsx:116
- `shortTermGoals` — src/pages/StrategyGrowth.tsx:149
- `sidebar-expanded-${item.title}` — src/components/sidebar/SidebarMenuItemComponent.tsx:23
- `sidebarMenuItems` — src/components/Sidebar.tsx:29
- `sidebarState` — src/components/Sidebar.tsx:39
- `todayScrollPosition` — src/components/planner/DailyPlanner.tsx:156
- `todayZoomLevel` — src/components/planner/DailyPlanner.tsx:122
- `user` — src/contexts/AuthContext.tsx:156
- `visionBoardData` — src/hooks/useVisionBoard.ts:8
- `visionBoardItems` — src/pages/VisionBoard.tsx:21
- `weeklyScrollPosition` — src/components/planner/DailyPlanner.tsx:173

## CustomEvent / event-bus names

- `allTasksUpdated` — src/pages/HomePage.tsx:261-276; src/components/planner/DailyPlanner.tsx:690
- `monthlyGoalsUpdated` — src/pages/HomePage.tsx:294; src/pages/StrategyGrowth.tsx:255-256
- `scheduledContentUpdated` — src/hooks/useCalendarState.ts:54-55; src/components/planner/DailyPlanner.tsx:691

## Top 10 largest files (by line count)

1. package-lock.json (12399)
2. src/pages/Production.tsx (3945)
3. src/components/planner/DailyPlanner.tsx (3718)
4. src/pages/StrategyGrowth.tsx (1878)
5. src/pages/OnboardingFlow.tsx (1310)
6. src/pages/Auth.tsx (1255)
7. src/pages/HomePage.tsx (835)
8. src/components/BrainDump.tsx (768)
9. src/components/ui/sidebar.tsx (761)
10. src/components/content/TitleHookSuggestions.tsx (753)
