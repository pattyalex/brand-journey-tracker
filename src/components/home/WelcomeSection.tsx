import React from "react";

interface WelcomeSectionProps {
  greeting: string;
}

const WelcomeSection: React.FC<WelcomeSectionProps> = ({ greeting }) => {
  return (
    <section className="mb-6 sm:mb-8">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Greeting */}
        <div className="min-w-0 flex-1">
          <h1
            className="text-[24px] sm:text-[32px] leading-tight mb-1 sm:mb-2"
            style={{
              fontFamily: "'Playfair Display', serif",
              fontWeight: 500,
              color: '#2d2a26'
            }}
          >
            {greeting}
          </h1>
          <p
            className="text-[14px] sm:text-[16px] text-gray-400"
            style={{ fontFamily: "'DM Sans', sans-serif" }}
          >
            Welcome to your creator studio
          </p>
        </div>

        {/* Right: Today's Date Badge */}
        <div
          className="flex-shrink-0 flex items-center gap-2 sm:gap-3"
          style={{ fontFamily: "'DM Sans', sans-serif" }}
        >
          <span
            className="text-[28px] sm:text-[40px] font-light text-[#2d2a26] -mt-2 sm:-mt-4"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {new Date().getDate()}
          </span>
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-medium text-[#2d2a26]">
              {new Date().toLocaleDateString('en-US', { weekday: 'long' })}
            </span>
            <span className="text-xs sm:text-sm text-gray-400">
              {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
