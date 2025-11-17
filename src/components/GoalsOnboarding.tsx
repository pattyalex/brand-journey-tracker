import React, { useState, useEffect } from 'react';
import Joyride, { CallBackProps, STATUS, Step } from 'react-joyride';

interface GoalsOnboardingProps {
  run: boolean;
  onComplete: () => void;
}

const GoalsOnboarding: React.FC<GoalsOnboardingProps> = ({ run, onComplete }) => {
  const [steps] = useState<Step[]>([
    {
      target: '[data-onboarding="goal-status-box"]',
      content: 'Click once to mark a goal as partially completed (yellow), click twice to mark it as fully completed (green). Click a third time to reset it.',
      disableBeacon: true,
      placement: 'right',
    }
  ]);

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      onComplete();
    }
  };

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      showProgress
      showSkipButton
      callback={handleJoyrideCallback}
      styles={{
        options: {
          primaryColor: '#8b5cf6',
          zIndex: 10000,
        },
        tooltip: {
          fontSize: 16,
          padding: 20,
        },
        tooltipContent: {
          padding: '10px 0',
        },
      }}
      locale={{
        back: 'Back',
        close: 'Close',
        last: 'Got it!',
        next: 'Next',
        skip: 'Skip tour',
      }}
    />
  );
};

export default GoalsOnboarding;
