import React from "react";

export const MissionStatementSection = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-1">Your Mission</h2>
      <p className="text-sm text-gray-500 mb-4">
        This is your anchor. Return to this when you feel lost, distracted, or overwhelmed. It's your why.
      </p>
      <textarea
        className="w-full min-h-[150px] p-4 text-sm leading-relaxed text-gray-800 border border-gray-100 rounded-xl resize-y focus:outline-none focus:border-[#612a4f] focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-all placeholder:text-gray-300"
        placeholder="Write your mission here — what you're here to do, what matters to you, and why you started this journey."
      />
    </div>
  );
};

export const AffirmationSection = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-semibold text-gray-800 mb-1">Your Affirmations</h2>
      <p className="text-sm text-gray-500 mb-4">
        Write down reminders or affirmations that help you stay grounded and focused on your bigger picture.
      </p>
      <textarea
        className="w-full min-h-[150px] p-4 text-sm leading-relaxed text-gray-800 border border-gray-100 rounded-xl resize-y focus:outline-none focus:border-[#612a4f] focus:shadow-[0_0_0_3px_rgba(97,42,79,0.1)] transition-all placeholder:text-gray-300"
        placeholder="Add daily affirmations that remind you of your purpose and values as a content creator."
      />
    </div>
  );
};

export const BrandStrategySections = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <MissionStatementSection />
      <AffirmationSection />
    </div>
  );
};

export default BrandStrategySections;