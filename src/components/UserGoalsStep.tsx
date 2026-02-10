import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface UserGoalsStepProps {
  onComplete: (answers: UserGoalsAnswers) => void;
}

interface UserGoalsAnswers {
  postFrequency: string;
  ideationMethod: string;
  teamStructure: string;
  creatorDream: string;
  platforms: string[];
  stuckAreas: string[];
  otherStuckArea?: string;
}

const questions = [
  {
    id: 'postFrequency',
    question: 'How often would you like to post?',
    type: 'single',
    options: [
      { value: 'several_times_a_day', label: 'Several times a day' },
      { value: 'daily', label: 'Daily' },
      { value: 'few_times_a_week', label: 'A few times a week' },
      { value: 'occasionally', label: 'Occasionally' },
    ],
  },
  {
    id: 'ideationMethod',
    question: 'How do you come up with content ideas?',
    type: 'single',
    options: [
      { value: 'plan_ahead', label: 'I plan them ahead' },
      { value: 'wing_it', label: 'I wing it day by day' },
      { value: 'follow_trends', label: 'I follow trends and repost' },
      { value: 'struggle', label: 'I struggle to come up with ideas' },
    ],
  },
  {
    id: 'teamStructure',
    question: 'Got any help with your content?',
    type: 'single',
    options: [
      { value: 'solo', label: 'Just me, and I like it that way' },
      { value: 'solo_wants_help', label: "Just me, but I'd love some help" },
      { value: 'has_assistant', label: 'I have an assistant or editor' },
      { value: 'team_agency', label: 'I work with a team or agency' },
    ],
  },
  {
    id: 'creatorDream',
    question: "What's your biggest dream as a creator?",
    type: 'single',
    options: [
      { value: 'quit_job', label: 'Quitting my job and going full-time' },
      { value: 'grow_followers', label: 'Growing my followers and engagement' },
      { value: 'build_brand', label: 'Building a personal brand that gets me brand deals' },
      { value: 'launch_products', label: 'Launching my own products or business' },
      { value: 'inspire_others', label: 'Inspiring others / making impact' },
    ],
  },
  {
    id: 'platforms',
    question: 'What platforms do you post on?',
    subtitle: 'Select all that apply',
    type: 'multiple',
    options: [
      { value: 'instagram', label: 'Instagram' },
      { value: 'tiktok', label: 'TikTok' },
      { value: 'youtube', label: 'YouTube' },
      { value: 'linkedin', label: 'LinkedIn' },
      { value: 'twitter', label: 'X / Threads' },
    ],
  },
  {
    id: 'stuckAreas',
    question: 'Where do you feel most stuck?',
    subtitle: 'Select all that apply',
    type: 'multiple',
    hasOther: true,
    options: [
      { value: 'consistency', label: 'Staying consistent' },
      { value: 'overwhelmed', label: 'Feeling overwhelmed with planning' },
      { value: 'ideas', label: 'Coming up with ideas' },
      { value: 'partnerships', label: 'Managing brand deals' },
      { value: 'analytics', label: 'Tracking growth and analytics' },
      { value: 'organization', label: 'Keeping everything organized' },
      { value: 'other', label: 'Other' },
    ],
  },
];

export const UserGoalsStep: React.FC<UserGoalsStepProps> = ({ onComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | string[]>>({});
  const [selectedMultiple, setSelectedMultiple] = useState<string[]>([]);
  const [otherText, setOtherText] = useState('');

  const brandGradient = 'linear-gradient(135deg, #7a3868 0%, #612a4f 50%, #4e2040 100%)';
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex) / totalQuestions) * 100;

  const handleSingleSelect = (value: string) => {
    setAnswers({ ...answers, [currentQuestion.id]: value });
  };

  const handleNext = () => {
    // For single choice, check if an answer is selected
    if (currentQuestion.type === 'single' && !answers[currentQuestion.id]) {
      return;
    }
    // For multiple choice, check if at least one option is selected
    if (currentQuestion.type === 'multiple' && selectedMultiple.length === 0) {
      return;
    }

    // Save multiple choice answers
    let finalAnswers = answers;
    if (currentQuestion.type === 'multiple') {
      finalAnswers = { ...answers, [currentQuestion.id]: selectedMultiple };
      // Save other text if "other" is selected
      if (currentQuestion.id === 'stuckAreas' && selectedMultiple.includes('other') && otherText.trim()) {
        finalAnswers = { ...finalAnswers, otherStuckArea: otherText.trim() };
      }
      setAnswers(finalAnswers);
    }

    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      // Load previously saved multiple choice answers if going forward
      const nextQuestion = questions[currentQuestionIndex + 1];
      if (nextQuestion.type === 'multiple' && finalAnswers[nextQuestion.id]) {
        setSelectedMultiple(finalAnswers[nextQuestion.id] as string[]);
      } else {
        setSelectedMultiple([]);
      }
      // Reset other text when moving to next question
      setOtherText('');
    } else {
      // Last question - complete
      onComplete(finalAnswers as unknown as UserGoalsAnswers);
    }
  };

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      // Save current multiple choice answers before going back
      if (currentQuestion.type === 'multiple' && selectedMultiple.length > 0) {
        setAnswers({ ...answers, [currentQuestion.id]: selectedMultiple });
      }

      const prevIndex = currentQuestionIndex - 1;
      setCurrentQuestionIndex(prevIndex);

      // Load previously saved multiple choice answers
      const prevQuestion = questions[prevIndex];
      if (prevQuestion.type === 'multiple' && answers[prevQuestion.id]) {
        setSelectedMultiple(answers[prevQuestion.id] as string[]);
      } else {
        setSelectedMultiple([]);
      }
    }
  };

  const handleMultipleToggle = (value: string) => {
    setSelectedMultiple((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const isSelected = (value: string) => {
    if (currentQuestion.type === 'single') {
      return answers[currentQuestion.id] === value;
    }
    return selectedMultiple.includes(value);
  };

  return (
    <div className="w-full max-w-lg mx-auto" style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <div
        className="rounded-3xl overflow-hidden"
        style={{
          background: '#ffffff',
          boxShadow: '0 25px 60px -12px rgba(97, 42, 79, 0.15), 0 0 0 1px rgba(139, 112, 130, 0.08)',
        }}
      >
        {/* Progress bar */}
        <div className="h-1 bg-gray-100">
          <div
            className="h-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%`, background: brandGradient }}
          />
        </div>

        <div className="p-8">
          {/* Question counter */}
          <p className="text-xs font-medium mb-4" style={{ color: '#8a7a85' }}>
            QUESTION {currentQuestionIndex + 1} OF {totalQuestions}
          </p>

          {/* Question */}
          <h2
            className="text-2xl font-normal mb-2"
            style={{ color: '#1a1523', fontFamily: "'Instrument Serif', serif" }}
          >
            {currentQuestion.question}
          </h2>

          {currentQuestion.subtitle && (
            <p className="text-sm mb-6" style={{ color: '#6b6478' }}>
              {currentQuestion.subtitle}
            </p>
          )}

          {!currentQuestion.subtitle && <div className="mb-6" />}

          {/* Options */}
          <div className="space-y-3">
            {currentQuestion.options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() =>
                  currentQuestion.type === 'single'
                    ? handleSingleSelect(option.value)
                    : handleMultipleToggle(option.value)
                }
                className="w-full text-left rounded-xl p-4 transition-all flex items-center justify-between"
                style={{
                  background: isSelected(option.value)
                    ? 'linear-gradient(135deg, rgba(122, 56, 104, 0.1) 0%, rgba(97, 42, 79, 0.07) 100%)'
                    : '#fafafa',
                  border: isSelected(option.value)
                    ? '1px solid #7a3868'
                    : '1px solid transparent',
                }}
              >
                <span
                  className="font-medium"
                  style={{ color: isSelected(option.value) ? '#4e2040' : '#4d3e48' }}
                >
                  {option.label}
                </span>
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0"
                  style={{
                    background: isSelected(option.value) ? brandGradient : '#e5e5e5',
                    transition: 'all 0.2s',
                  }}
                >
                  {isSelected(option.value) && <Check className="w-4 h-4 text-white" />}
                </div>
              </button>
            ))}
          </div>

          {/* Other input field - shows when "other" is selected on stuckAreas */}
          {currentQuestion.id === 'stuckAreas' && selectedMultiple.includes('other') && (
            <div className="mt-3">
              <input
                type="text"
                value={otherText}
                onChange={(e) => setOtherText(e.target.value)}
                placeholder="Tell us what's holding you back..."
                className="w-full px-4 py-3 rounded-xl text-sm transition-all outline-none"
                style={{
                  background: '#fafafa',
                  border: '1px solid #e5e0e3',
                  color: '#4d3e48',
                }}
                onFocus={(e) => {
                  e.target.style.border = '1px solid #7a3868';
                  e.target.style.background = '#ffffff';
                }}
                onBlur={(e) => {
                  e.target.style.border = '1px solid #e5e0e3';
                  e.target.style.background = '#fafafa';
                }}
              />
            </div>
          )}

          {/* Navigation buttons */}
          <div className="flex items-center justify-between mt-6">
            {/* Back button - only show if not on first question */}
            {currentQuestionIndex > 0 ? (
              <button
                type="button"
                onClick={handleBack}
                className="flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors hover:bg-gray-100"
                style={{ color: '#6b6478' }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m15 18-6-6 6-6" />
                </svg>
                Back
              </button>
            ) : (
              <div />
            )}

            {/* Next button - subtle but visible */}
            <button
              type="button"
              onClick={handleNext}
              disabled={
                (currentQuestion.type === 'single' && !answers[currentQuestion.id]) ||
                (currentQuestion.type === 'multiple' && selectedMultiple.length === 0) ||
                (currentQuestion.id === 'stuckAreas' && selectedMultiple.includes('other') && !otherText.trim())
              }
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              style={{
                background: (
                  ((currentQuestion.type === 'single' && answers[currentQuestion.id]) ||
                   (currentQuestion.type === 'multiple' && selectedMultiple.length > 0)) &&
                  !(currentQuestion.id === 'stuckAreas' && selectedMultiple.includes('other') && !otherText.trim())
                ) ? 'rgba(122, 56, 104, 0.1)' : 'transparent',
                color: (
                  ((currentQuestion.type === 'single' && answers[currentQuestion.id]) ||
                   (currentQuestion.type === 'multiple' && selectedMultiple.length > 0)) &&
                  !(currentQuestion.id === 'stuckAreas' && selectedMultiple.includes('other') && !otherText.trim())
                ) ? '#612a4f' : '#a0a0a0',
                border: (
                  ((currentQuestion.type === 'single' && answers[currentQuestion.id]) ||
                   (currentQuestion.type === 'multiple' && selectedMultiple.length > 0)) &&
                  !(currentQuestion.id === 'stuckAreas' && selectedMultiple.includes('other') && !otherText.trim())
                ) ? '1px solid rgba(122, 56, 104, 0.3)' : '1px solid transparent'
              }}
            >
              {currentQuestionIndex === totalQuestions - 1 ? 'Continue' : 'Next'}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
