
import React from "react";
import "./BrandStrategySections.css";

export const MissionStatementSection = () => {
  return (
    <div className="strategy-section mission-section">
      <h2 className="section-title">Your Mission</h2>
      <p className="section-subtitle">
        This is your anchor. Return to this when you feel lost, distracted, or overwhelmed. It's your why.
      </p>
      <textarea
        className="text-area"
        placeholder="Write your mission here — what you're here to do, what matters to you, and why you started this journey."
      />
    </div>
  );
};

export const AffirmationSection = () => {
  return (
    <div className="strategy-section affirmation-section">
      <h2 className="section-title">Your Affirmations</h2>
      <p className="section-subtitle">
        Write down reminders or affirmations that help you stay grounded and focused on your bigger picture.
      </p>
      <textarea
        className="text-area"
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
